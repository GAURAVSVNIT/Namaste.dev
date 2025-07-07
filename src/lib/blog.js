import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import slugify from 'slugify';

// Generate a unique slug from title
export const generateSlug = (title) => {
  return slugify(title, { lower: true, strict: true });
};

// Create a new blog post
export const createBlog = async (blogData, authorId, authorName) => {
  try {
    const slug = generateSlug(blogData.title);
    
    const blogPost = {
      title: blogData.title,
      content: blogData.content,
      snippet: blogData.snippet || blogData.content.substring(0, 150) + '...',
      slug: slug,
      authorId: authorId,
      authorName: authorName,
      tags: blogData.tags || [],
      imageUrl: blogData.imageUrl || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: []
    };

    const docRef = await addDoc(collection(db, 'blogs'), blogPost);
    
    // Add activity to user profile
    try {
      const { addActivity } = await import('./user');
      await addActivity(authorId, {
        type: 'created',
        blogId: docRef.id,
        blogTitle: blogData.title,
        blogSlug: slug
      });
    } catch (activityError) {
      console.error('Error adding activity:', activityError);
      // Don't fail blog creation if activity fails
    }
    
    return { id: docRef.id, ...blogPost };
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// Get all blogs
export const getAllBlogs = async () => {
  try {
    // Try with orderBy first, fallback to no ordering if index doesn't exist
    let querySnapshot;
    try {
      const q = query(
        collection(db, 'blogs'),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.log('Index not available, falling back to client-side sorting');
      // Fallback to simple query without ordering
      const q = query(collection(db, 'blogs'));
      querySnapshot = await getDocs(q);
    }
    
    const blogs = [];
    querySnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort client-side if we didn't use orderBy
    blogs.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      return dateB - dateA; // desc order
    });
    
    return blogs;
  } catch (error) {
    console.error('Error getting blogs:', error);
    throw error;
  }
};

// Get a blog by slug
export const getBlogBySlug = async (slug) => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('slug', '==', slug)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting blog by slug:', error);
    throw error;
  }
};

// Get a blog by ID
export const getBlogById = async (id) => {
  try {
    const docRef = doc(db, 'blogs', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting blog by ID:', error);
    throw error;
  }
};

// Update a blog post
export const updateBlog = async (id, blogData) => {
  try {
    const docRef = doc(db, 'blogs', id);
    const updateData = {
      ...blogData,
      updatedAt: serverTimestamp()
    };
    
    // Update slug if title changed
    if (blogData.title) {
      updateData.slug = generateSlug(blogData.title);
    }
    
    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlog = async (id) => {
  try {
    const docRef = doc(db, 'blogs', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Get blogs by author
export const getBlogsByAuthor = async (authorId) => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('authorId', '==', authorId)
    );
    const querySnapshot = await getDocs(q);
    const blogs = [];
    
    querySnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort client-side to avoid requiring index
    blogs.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      return dateB - dateA; // desc order
    });
    
    return blogs;
  } catch (error) {
    console.error('Error getting blogs by author:', error);
    throw error;
  }
};

// Like/unlike a blog post
export const toggleLike = async (blogId, userId) => {
  try {
    const docRef = doc(db, 'blogs', blogId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || [];
      const isLiked = currentLikes.includes(userId);
      
      let newLikes;
      if (isLiked) {
        newLikes = currentLikes.filter(id => id !== userId);
      } else {
        newLikes = [...currentLikes, userId];
      }
      
      await updateDoc(docRef, {
        likes: newLikes,
        updatedAt: serverTimestamp()
      });
      
      return { liked: !isLiked, likesCount: newLikes.length };
    }
    
    throw new Error('Blog not found');
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};
