import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
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

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_LOOK = 4;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_PAGINATION_LIMIT = 20;

// Mood options
export const MOODS = [
  'Elegant',
  'Chill',
  'Bold',
  'Casual',
  'Edgy',
  'Romantic',
  'Minimalist',
  'Vintage',
  'Sporty',
  'Sophisticated'
];

/**
 * Upload images to Firebase Storage
 * @param {string} userId - User ID
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadLookImages = async (userId, files) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!files || files.length === 0) {
    throw new Error('At least one file is required');
  }

  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${Date.now()}_${index}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `looks/${userId}/${fileName}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to upload image: ${file.name}`);
    }
  });

  return Promise.all(uploadPromises);
};

/**
 * Create a new look
 * @param {string} userId - User ID
 * @param {Object} lookData - Look data
 * @param {string[]} lookData.images - Array of image URLs
 * @param {string} lookData.caption - Look caption
 * @param {string[]} lookData.tags - Array of tags
 * @param {string} lookData.mood - Look mood
 * @param {string[]} lookData.colorPalette - Array of color hex codes
 * @returns {Promise<Object>} Created look object
 */
export const createLook = async (userId, lookData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!lookData.images || lookData.images.length === 0) {
    throw new Error('At least one image is required');
  }
  
  if (!lookData.caption?.trim()) {
    throw new Error('Caption is required');
  }
  
  if (!lookData.mood) {
    throw new Error('Mood is required');
  }

  try {
    const look = {
      userId,
      images: lookData.images,
      caption: lookData.caption.trim(),
      tags: Array.isArray(lookData.tags) ? lookData.tags : [],
      mood: lookData.mood,
      colorPalette: Array.isArray(lookData.colorPalette) ? lookData.colorPalette : [],
      likes: [],
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'looks'), look);
    
    // Log activity for creating a look
    await addDoc(collection(db, 'user_activities'), {
      userId,
      type: 'created',
      contentType: 'look',
      lookTitle: lookData.caption.trim(),
      lookId: docRef.id,
      timestamp: serverTimestamp()
    });
    
    return { id: docRef.id, ...look };
  } catch (error) {
    throw new Error('Failed to create look');
  }
};

/**
 * Get all looks with pagination
 * @param {number} limitCount - Number of looks to fetch
 * @param {DocumentSnapshot} lastDoc - Last document for pagination
 * @returns {Promise<Array>} Array of look objects
 */
export const getAllLooks = async (limitCount = DEFAULT_PAGINATION_LIMIT, lastDoc = null) => {
  try {
    let q = query(
      collection(db, 'looks'),
      orderBy('createdAt', 'desc')
    );

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const looks = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      looks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return looks;
  } catch (error) {
    throw new Error('Failed to fetch looks');
  }
};

/**
 * Get looks by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's look objects
 */
export const getLooksByUser = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const q = query(
      collection(db, 'looks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const looks = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      looks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return looks;
  } catch (error) {
    throw new Error('Failed to fetch user looks');
  }
};

/**
 * Get look by ID
 * @param {string} lookId - Look ID
 * @returns {Promise<Object>} Look object
 */
export const getLookById = async (lookId) => {
  if (!lookId) {
    throw new Error('Look ID is required');
  }

  try {
    const docRef = doc(db, 'looks', lookId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } else {
      throw new Error('Look not found');
    }
  } catch (error) {
    throw new Error('Failed to fetch look');
  }
};

/**
 * Filter looks by tags
 * @param {Array} tags - Array of tags to filter by
 * @returns {Promise<Array>} Array of filtered look objects
 */
export const getLooksByTags = async (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('Tags array is required');
  }

  try {
    const q = query(
      collection(db, 'looks'),
      where('tags', 'array-contains-any', tags),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const looks = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      looks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return looks;
  } catch (error) {
    throw new Error('Failed to fetch looks by tags');
  }
};

/**
 * Filter looks by mood
 * @param {string} mood - Mood to filter by
 * @returns {Promise<Array>} Array of filtered look objects
 */
export const getLooksByMood = async (mood) => {
  if (!mood) {
    throw new Error('Mood is required');
  }

  if (!MOODS.includes(mood)) {
    throw new Error('Invalid mood specified');
  }

  try {
    const q = query(
      collection(db, 'looks'),
      where('mood', '==', mood),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const looks = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      looks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return looks;
  } catch (error) {
    throw new Error('Failed to fetch looks by mood');
  }
};

/**
 * Toggle like on a look
 * @param {string} lookId - Look ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object with liked status and likes count
 */
export const toggleLikeLook = async (lookId, userId) => {
  if (!lookId || !userId) {
    throw new Error('Look ID and User ID are required');
  }

  try {
    const lookRef = doc(db, 'looks', lookId);
    const lookSnap = await getDoc(lookRef);

    if (!lookSnap.exists()) {
      throw new Error('Look not found');
    }

    const lookData = lookSnap.data();
    const currentLikes = lookData.likes || [];
    const isLiked = currentLikes.includes(userId);

    if (isLiked) {
      // Remove like from looks collection
      await updateDoc(lookRef, {
        likes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      // Remove from user_likes collection
      const userLikesQuery = query(
        collection(db, 'user_likes'),
        where('userId', '==', userId),
        where('contentId', '==', lookId)
      );
      const userLikesSnapshot = await getDocs(userLikesQuery);
      
      if (!userLikesSnapshot.empty) {
        const likeDoc = userLikesSnapshot.docs[0];
        await deleteDoc(doc(db, 'user_likes', likeDoc.id));
      }
      
      return { liked: false, likesCount: currentLikes.length - 1 };
    } else {
      // Add like to looks collection
      await updateDoc(lookRef, {
        likes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      
      // Add to user_likes collection for profile tracking
      await addDoc(collection(db, 'user_likes'), {
        userId,
        contentId: lookId,
        contentType: 'look',
        title: lookData.caption || 'Untitled Look',
        thumbnail: lookData.images?.[0] || null,
        author: lookData.userId || 'Unknown',
        type: 'Look',
        likedAt: serverTimestamp()
      });
      
      // Log activity for liking a look
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'liked',
        contentType: 'look',
        lookTitle: lookData.caption || 'Untitled Look',
        lookId: lookId,
        timestamp: serverTimestamp()
      });
      
      return { liked: true, likesCount: currentLikes.length + 1 };
    }
  } catch (error) {
    throw new Error('Failed to toggle like');
  }
};

/**
 * Update look
 * @param {string} lookId - Look ID
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Success status
 */
export const updateLook = async (lookId, userId, updates) => {
  if (!lookId || !userId) {
    throw new Error('Look ID and User ID are required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates object is required');
  }

  try {
    const lookRef = doc(db, 'looks', lookId);
    const lookSnap = await getDoc(lookRef);

    if (!lookSnap.exists()) {
      throw new Error('Look not found');
    }

    const lookData = lookSnap.data();
    
    // Check if user owns the look
    if (lookData.userId !== userId) {
      throw new Error('Unauthorized: You can only edit your own looks');
    }

    await updateDoc(lookRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    throw new Error('Failed to update look');
  }
};

/**
 * Delete look
 * @param {string} lookId - Look ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success status
 */
export const deleteLook = async (lookId, userId) => {
  if (!lookId || !userId) {
    throw new Error('Look ID and User ID are required');
  }

  try {
    const lookRef = doc(db, 'looks', lookId);
    const lookSnap = await getDoc(lookRef);

    if (!lookSnap.exists()) {
      throw new Error('Look not found');
    }

    const lookData = lookSnap.data();
    
    // Check if user owns the look
    if (lookData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own looks');
    }

    // Delete images from storage
    if (lookData.images && lookData.images.length > 0) {
      const deletePromises = lookData.images.map(async (imageUrl) => {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          // Continue even if some images fail to delete
          // This prevents the entire operation from failing
        }
      });
      
      await Promise.allSettled(deletePromises);
    }

    // Delete the look document
    await deleteDoc(lookRef);
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete look');
  }
};

/**
 * Add comment to look
 * @param {string} lookId - Look ID
 * @param {string} userId - User ID
 * @param {string} comment - Comment text
 * @returns {Promise<Object>} Created comment data
 */
export const addCommentToLook = async (lookId, userId, comment) => {
  if (!lookId || !userId || !comment?.trim()) {
    throw new Error('Look ID, User ID, and comment text are required');
  }

  try {
    const lookRef = doc(db, 'looks', lookId);
    const commentData = {
      id: Date.now().toString(),
      userId,
      text: comment.trim(),
      createdAt: new Date()
    };

    await updateDoc(lookRef, {
      comments: arrayUnion(commentData),
      updatedAt: serverTimestamp()
    });

    return commentData;
  } catch (error) {
    throw new Error('Failed to add comment');
  }
};

/**
 * Delete comment from look
 * @param {string} lookId - Look ID
 * @param {string} userId - User ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>} Success status
 */
export const deleteCommentFromLook = async (lookId, userId, commentId) => {
  if (!lookId || !userId || !commentId) {
    throw new Error('Look ID, User ID, and comment ID are required');
  }

  try {
    const lookRef = doc(db, 'looks', lookId);
    const lookSnap = await getDoc(lookRef);

    if (!lookSnap.exists()) {
      throw new Error('Look not found');
    }

    const lookData = lookSnap.data();
    const comments = lookData.comments || [];
    const comment = comments.find(c => c.id === commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user owns the comment or the look
    if (comment.userId !== userId && lookData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    await updateDoc(lookRef, {
      comments: arrayRemove(comment),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete comment');
  }
};
