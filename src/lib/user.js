import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        uid: userId,
        ...userSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Update user profile
export const updateUser = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Upload avatar to Firebase Storage
export const uploadAvatar = async (userId, file) => {
  try {
    const storageRef = ref(storage, `avatars/${userId}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user's photoURL in Firestore
    await updateUser(userId, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Like a blog (sync with blog document)
export const likeBlog = async (userId, blogId) => {
  try {
    // First update the blog's likes array
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      likes: arrayUnion(userId)
    });
    
    // Get blog details for activity
    const { getBlogById } = await import('./blog');
    const blog = await getBlogById(blogId);
    
    // Then update user's liked blogs and activity
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likedBlogs: arrayUnion(blogId),
      activity: arrayUnion({
        type: 'liked',
        blogId: blogId,
        blogTitle: blog?.title || 'Unknown Blog',
        blogSlug: blog?.slug || blogId,
        timestamp: new Date()
      })
    });
    
    // Clear cache to ensure fresh data on next sync
    syncCache.delete(`sync_${userId}`);
  } catch (error) {
    console.error('Error liking blog:', error);
    throw error;
  }
};

// Unlike a blog (sync with blog document)
export const unlikeBlog = async (userId, blogId) => {
  try {
    // First update the blog's likes array
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      likes: arrayRemove(userId)
    });
    
    // Then update user's liked blogs
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likedBlogs: arrayRemove(blogId)
    });
    
    // Clear cache to ensure fresh data on next sync
    syncCache.delete(`sync_${userId}`);
  } catch (error) {
    console.error('Error unliking blog:', error);
    throw error;
  }
};

// Add activity to user profile
export const addActivity = async (userId, activity) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      activity: arrayUnion({
        ...activity,
        timestamp: new Date()
      })
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

// Get user's liked blogs
export const getUserLikedBlogs = async (userId) => {
  try {
    const user = await getUserById(userId);
    return user?.likedBlogs || [];
  } catch (error) {
    console.error('Error getting liked blogs:', error);
    throw error;
  }
};

// Get user's activity
export const getUserActivity = async (userId) => {
  try {
    const user = await getUserById(userId);
    return user?.activity || [];
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
};

// Populate activities from existing data (one-time utility)
export const populateActivitiesFromExistingData = async (userId) => {
  try {
    const { getBlogsByAuthor } = await import('./blog');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    const activities = [];
    
    // Get user's blogs and add 'created' activities
    const userBlogs = await getBlogsByAuthor(userId);
    userBlogs.forEach(blog => {
      activities.push({
        type: 'created',
        blogId: blog.id,
        blogTitle: blog.title,
        blogSlug: blog.slug,
        timestamp: blog.createdAt
      });
    });
    
    // Get blogs user has liked and add 'liked' activities
    const likedBlogIds = await syncUserLikedBlogs(userId);
    for (const blogId of likedBlogIds) {
      try {
        const { getBlogById } = await import('./blog');
        const blog = await getBlogById(blogId);
        if (blog) {
          activities.push({
            type: 'liked',
            blogId: blog.id,
            blogTitle: blog.title,
            blogSlug: blog.slug,
            timestamp: new Date() // We don't have exact like timestamp, use current
          });
        }
      } catch (error) {
        console.error('Error loading blog for activity:', error);
      }
    }
    
    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => {
      const dateA = a.timestamp instanceof Date 
        ? a.timestamp 
        : new Date(a.timestamp?.seconds * 1000 || a.timestamp);
      const dateB = b.timestamp instanceof Date 
        ? b.timestamp 
        : new Date(b.timestamp?.seconds * 1000 || b.timestamp);
      return dateB - dateA;
    });
    
    // Update user's activity array
    if (activities.length > 0) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        activity: activities
      });
    }
    
    return activities;
  } catch (error) {
    console.error('Error populating activities:', error);
    throw error;
  }
};

// Cache to prevent excessive sync calls
const syncCache = new Map();
const SYNC_CACHE_DURATION = 30000; // 30 seconds

// Sync user's liked blogs from blog documents (utility function)
export const syncUserLikedBlogs = async (userId) => {
  try {
    // Check cache first
    const cacheKey = `sync_${userId}`;
    const cached = syncCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SYNC_CACHE_DURATION) {
      return cached.data;
    }
    
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    // Find all blogs that have this user in their likes array
    const q = query(
      collection(db, 'blogs'),
      where('likes', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const likedBlogIds = [];
    
    querySnapshot.forEach((doc) => {
      likedBlogIds.push(doc.id);
    });
    
    // Only update if there's a difference
    const currentUser = await getUserById(userId);
    const currentLikedBlogs = currentUser?.likedBlogs || [];
    
    // Check if arrays are different
    const arraysEqual = likedBlogIds.length === currentLikedBlogs.length && 
                       likedBlogIds.every(id => currentLikedBlogs.includes(id));
    
    if (!arraysEqual) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        likedBlogs: likedBlogIds
      });
    }
    
    // Cache the result
    syncCache.set(cacheKey, {
      data: likedBlogIds,
      timestamp: Date.now()
    });
    
    return likedBlogIds;
  } catch (error) {
    console.error('Error syncing liked blogs:', error);
    throw error;
  }
};
