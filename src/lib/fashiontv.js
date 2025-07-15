import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
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
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from './firebase';
import { getUserById } from './user';

/**
 * Upload video to Firebase Storage and save metadata
 * @param {string} userId - User ID
 * @param {File} file - Video file
 * @param {Object} videoData - Video metadata
 * @returns {Promise<Object>} Created video object
 */
export const uploadVideo = async (userId, file, videoData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!file) {
    throw new Error('Video file is required');
  }
  
    if (!videoData.caption?.trim()) {
    throw new Error('Caption is required');
  }

  // Validate file type
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only MP4, MOV, and WebM are allowed');
  }

  // Validate file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size exceeds 100MB limit');
  }

  // Validate duration (60 seconds limit)
  if (videoData.duration && videoData.duration > 60) {
    throw new Error('Video duration exceeds 60 seconds limit');
  }

  try {
    // Get user data
    const userData = await getUserById(userId);
    const userName = userData.name || userData.email || 'Unknown User';

    // Upload video to storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `fashiontv_videos/${userId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const videoUrl = await getDownloadURL(snapshot.ref);

    // Create video metadata
    const video = {
      userId,
      userName,
      userAvatar: userData.photoURL || null,
      videoUrl,
      caption: videoData.caption.trim(),
      tags: videoData.tags || [],
      aspectRatio: '1:1',
      duration: videoData.duration || 0,
      fileSize: file.size,
      likes: [],
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'fashiontv_videos'), video);
    return { id: docRef.id, ...video };
  } catch (error) {
    throw new Error('Failed to upload video');
  }
};

/**
 * Get all videos with pagination
 * @param {number} limitCount - Number of videos to fetch
 * @param {DocumentSnapshot} lastDoc - Last document for pagination
 * @returns {Promise<Object>} Object with videos array and lastDocument
 */
export const getAllVideos = async (limitCount = 10, lastDoc = null) => {
  try {
    let q = query(
      collection(db, 'fashiontv_videos'),
      orderBy('createdAt', 'desc')
    );

    if (limitCount && limitCount > 0) {
      q = query(q, limit(limitCount));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const videos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { videos, lastDocument };
  } catch (error) {
    throw new Error('Failed to fetch videos');
  }
};

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Video object
 */
export const getVideoById = async (videoId) => {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    const docRef = doc(db, 'fashiontv_videos', videoId);
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
      throw new Error('Video not found');
    }
  } catch (error) {
    if (error.message === 'Video not found') {
      throw error;
    }
    throw new Error(`Failed to fetch video: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Toggle like on a video
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object with liked status and likes count
 */
export const toggleLikeVideo = async (videoId, userId) => {
  if (!videoId || !userId) {
    throw new Error('Video ID and User ID are required');
  }

  try {
    const videoRef = doc(db, 'fashiontv_videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      throw new Error('Video not found');
    }

    const videoData = videoSnap.data();
    const currentLikes = videoData.likes || [];
    const isLiked = currentLikes.includes(userId);

    if (isLiked) {
      // Remove like
      await updateDoc(videoRef, {
        likes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      return { liked: false, likesCount: currentLikes.length - 1 };
    } else {
      // Add like
      await updateDoc(videoRef, {
        likes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      return { liked: true, likesCount: currentLikes.length + 1 };
    }
  } catch (error) {
    throw new Error('Failed to toggle like');
  }
};

/**
 * Increment view count for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<void>}
 */
export const incrementViewCount = async (videoId) => {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    const videoRef = doc(db, 'fashiontv_videos', videoId);
    const videoSnap = await getDoc(videoRef);

    await updateDoc(videoRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('Failed to increment view count:', error);
  }
};

/**
 * Get videos by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's video objects
 */
export const getUserVideos = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const q = query(
      collection(db, 'fashiontv_videos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const videos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return videos;
  } catch (error) {
    throw new Error('Failed to fetch user videos');
  }
};
