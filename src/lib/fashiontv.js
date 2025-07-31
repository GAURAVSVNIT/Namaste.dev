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
  arrayRemove,
  increment
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
 * @param {Blob} thumbnailBlob - Optional thumbnail blob
 * @returns {Promise<Object>} Created video object
 */
export const uploadVideo = async (userId, file, videoData, thumbnailBlob = null) => {
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
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const videoStorageRef = ref(storage, `fashiontv_videos/${userId}/${fileName}`);
    
    const videoSnapshot = await uploadBytes(videoStorageRef, file);
    const videoUrl = await getDownloadURL(videoSnapshot.ref);

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailBlob) {
      const thumbnailFileName = `thumb_${timestamp}_${fileName.replace(/\.[^/.]+$/, '')}.jpg`;
      const thumbnailStorageRef = ref(storage, `fashiontv_thumbnails/${userId}/${thumbnailFileName}`);
      
      const thumbnailSnapshot = await uploadBytes(thumbnailStorageRef, thumbnailBlob);
      thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);
    }

    // Create video metadata
    const video = {
      userId,
      userName,
      userAvatar: userData.photoURL || null,
      videoUrl,
      thumbnail: thumbnailUrl,
      caption: videoData.caption.trim(),
      tags: videoData.tags || [],
      aspectRatio: videoData.aspectRatio || '9:16',
      duration: videoData.duration || 0,
      fileSize: file.size,
      dimensions: videoData.dimensions || null,
      likes: [],
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'fashiontv_videos'), video);
    
    // Log activity for creating a reel/video
    await addDoc(collection(db, 'user_activities'), {
      userId,
      type: 'created',
      contentType: 'reel',
      reelTitle: videoData.caption.trim(),
      reelId: docRef.id,
      timestamp: serverTimestamp()
    });
    
    return { id: docRef.id, ...video };
  } catch (error) {
    console.error('Upload video error:', error);
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

      // Remove from user_likes
      const likeQuery = query(
        collection(db, 'user_likes'),
        where('userId', '==', userId),
        where('contentId', '==', videoId)
      );

      const likeSnapshot = await getDocs(likeQuery);
      if (!likeSnapshot.empty) {
        const likeDoc = likeSnapshot.docs[0];
        await deleteDoc(doc(db, 'user_likes', likeDoc.id));
      }

      return { liked: false, likesCount: currentLikes.length - 1 };
    } else {
      // Add like
      await updateDoc(videoRef, {
        likes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });

      // Add to user_likes
      await addDoc(collection(db, 'user_likes'), {
        userId,
        contentId: videoId,
        contentType: 'reel',
        caption: videoData.caption || 'Untitled Reel',
        likedAt: serverTimestamp()
      });

      // Log activity for liking a reel/video
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'liked',
        contentType: 'reel',
        reelTitle: videoData.caption || 'Untitled Reel',
        reelId: videoId,
        timestamp: serverTimestamp()
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

/**
 * Delete a video/reel
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID (for permission check)
 * @returns {Promise<void>}
 */
export const deleteVideo = async (videoId, userId) => {
  if (!videoId) {
    throw new Error('Video ID is required');
  }  
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // First, get the video to check ownership
    const videoRef = doc(db, 'fashiontv_videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      throw new Error('Video not found');
    }

    const videoData = videoSnap.data();
    
    // Check if user owns the video
    if (videoData.userId !== userId) {
      throw new Error('You can only delete your own videos');
    }

    // Delete the video document
    await deleteDoc(videoRef);

    // Clean up related data
    // Delete all likes for this video
    const likesQuery = query(
      collection(db, 'user_likes'),
      where('contentId', '==', videoId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    const deleteLikesPromises = likesSnapshot.docs.map(likeDoc => 
      deleteDoc(doc(db, 'user_likes', likeDoc.id))
    );
    await Promise.all(deleteLikesPromises);

    // Delete related activities
    const activitiesQuery = query(
      collection(db, 'user_activities'),
      where('reelId', '==', videoId)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);
    const deleteActivitiesPromises = activitiesSnapshot.docs.map(activityDoc => 
      deleteDoc(doc(db, 'user_activities', activityDoc.id))
    );
    await Promise.all(deleteActivitiesPromises);

    // Log deletion activity
    await addDoc(collection(db, 'user_activities'), {
      userId,
      type: 'deleted',
      contentType: 'reel',
      reelTitle: videoData.caption || 'Untitled Reel',
      reelId: videoId,
      timestamp: serverTimestamp()
    });

    console.log('Video deleted successfully:', videoId);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error(error.message || 'Failed to delete video');
  }
};

// LIVESTREAM FUNCTIONS

/**
 * Add a new livestream
 * @param {string} userId - User ID
 * @param {Object} streamData - Stream metadata
 * @returns {Promise<Object>} Created stream object
 */
export const addLivestream = async (userId, streamData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!streamData.title?.trim()) {
    throw new Error('Stream title is required');
  }

  if (!streamData.url?.trim()) {
    throw new Error('Stream URL is required');
  }

  if (!streamData.platform) {
    throw new Error('Platform is required');
  }

  try {
    // Get user data
    const userData = await getUserById(userId);
    const userName = userData.name || userData.email || 'Unknown User';

    // Create stream metadata
    const stream = {
      userId,
      userName,
      userAvatar: userData.photoURL || null,
      title: streamData.title.trim(),
      description: streamData.description?.trim() || '',
      platform: streamData.platform, // 'youtube' or 'twitch'
      url: streamData.url.trim(),
      thumbnail: streamData.thumbnail || null,
      addedBy: userId,
      approved: true, // Auto-approve all streams for now (change to false if you want manual approval)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'livestreams'), stream);
    return { id: docRef.id, ...stream };
  } catch (error) {
    throw new Error('Failed to add livestream');
  }
};

/**
 * Get all approved livestreams
 * @param {number} limitCount - Number of streams to fetch
 * @returns {Promise<Array>} Array of stream objects
 */
export const getApprovedLivestreams = async (limitCount = 20) => {
  try {
    // First check if collection exists by trying to get all documents
    const collectionRef = collection(db, 'livestreams');
    
    // Get all documents first, then filter and sort in memory
    // This avoids the composite index requirement
    const querySnapshot = await getDocs(collectionRef);
    const streams = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include approved streams
      if (data.approved === true) {
        streams.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      }
    });

    // Sort by createdAt in descending order
    streams.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if specified
    if (limitCount && limitCount > 0) {
      return streams.slice(0, limitCount);
    }

    return streams;
  } catch (error) {
    console.error('Error fetching livestreams:', error);
    // If collection doesn't exist or there's an error, return empty array
    return [];
  }
};

/**
 * Get all livestreams (for admin)
 * @param {number} limitCount - Number of streams to fetch
 * @returns {Promise<Array>} Array of stream objects
 */
export const getAllLivestreams = async (limitCount = 50) => {
  try {
    const collectionRef = collection(db, 'livestreams');
    
    // Get all documents first, then sort in memory
    const querySnapshot = await getDocs(collectionRef);
    const streams = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      streams.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    // Sort by createdAt in descending order
    streams.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if specified
    if (limitCount && limitCount > 0) {
      return streams.slice(0, limitCount);
    }

    return streams;
  } catch (error) {
    console.error('Error fetching all livestreams:', error);
    // If collection doesn't exist or there's an error, return empty array
    return [];
  }
};

/**
 * Update livestream approval status
 * @param {string} streamId - Stream ID
 * @param {boolean} approved - Approval status
 * @returns {Promise<void>}
 */
export const updateStreamApproval = async (streamId, approved) => {
  if (!streamId) {
    throw new Error('Stream ID is required');
  }

  try {
    const streamRef = doc(db, 'livestreams', streamId);
    await updateDoc(streamRef, {
      approved,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error('Failed to update stream approval');
  }
};

/**
 * Get livestream by ID
 * @param {string} streamId - Stream ID
 * @returns {Promise<Object>} Stream object
 */
export const getLivestreamById = async (streamId) => {
  if (!streamId) {
    throw new Error('Stream ID is required');
  }

  try {
    const docRef = doc(db, 'livestreams', streamId);
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
      throw new Error('Livestream not found');
    }
  } catch (error) {
    if (error.message === 'Livestream not found') {
      throw error;
    }
    throw new Error(`Failed to fetch livestream: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Delete a livestream
 * @param {string} streamId - Stream ID
 * @returns {Promise<void>}
 */
export const deleteLivestream = async (streamId) => {
  if (!streamId) {
    throw new Error('Stream ID is required');
  }

  try {
    const streamRef = doc(db, 'livestreams', streamId);
    await deleteDoc(streamRef);
  } catch (error) {
    throw new Error('Failed to delete livestream');
  }
};

/**
 * Parse and validate stream URLs
 * @param {string} url - Stream URL
 * @returns {Object} Parsed stream info
 */
export const parseStreamUrl = (url) => {
  if (!url) {
    throw new Error('URL is required');
  }

  const trimmedUrl = url.trim();

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    /youtube\.com\/channel\/([\w-]+)/,
    /youtube\.com\/c\/([\w-]+)/,
    /youtube\.com\/@([\w-]+)/
  ];

  // Twitch patterns
  const twitchPatterns = [
    /twitch\.tv\/([\w-]+)/
  ];

  // Check YouTube
  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return {
        platform: 'youtube',
        channelId: match[1],
        embedUrl: `https://www.youtube.com/embed/live_stream?channel=${match[1]}`
      };
    }
  }

  // Check Twitch
  for (const pattern of twitchPatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return {
        platform: 'twitch',
        channelName: match[1],
        embedUrl: trimmedUrl
      };
    }
  }

  throw new Error('Unsupported URL format. Please use YouTube or Twitch URLs.');
};
