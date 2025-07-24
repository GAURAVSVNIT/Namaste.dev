import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get user's social media profile data
 * @param {string} userId - The user's ID
 * @returns {Object} User's social media profile data
 */
export const getUserSocialData = async (userId) => {
  try {
    // Get user basic info
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    // Get user's looks (social posts)
    const looksQuery = query(
      collection(db, 'looks'),
      where('userId', '==', userId)
    );
    const looksSnapshot = await getDocs(looksQuery);
    const looks = looksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.caption || 'Untitled Look',
        image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null,
        type: 'Look',
        views: 0, // looks don't have views in current schema
        likes: Array.isArray(data.likes) ? data.likes.length : 0,
        comments: Array.isArray(data.comments) ? data.comments.length : 0,
        createdAt: data.createdAt,
        // Store original data for reference but don't spread to avoid overwriting mapped fields
        originalData: data
      };
    });
    
    // Sort looks by createdAt in memory to avoid index requirement
    looks.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return bTime - aTime;
    });

    // Get user's reels (fashiontv videos)
    const reelsQuery = query(
      collection(db, 'fashiontv_videos'),
      where('userId', '==', userId)
    );
    const reelsSnapshot = await getDocs(reelsQuery);
    const reels = reelsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.caption || 'Untitled Reel',
        thumbnail: data.videoUrl,
        duration: data.duration || 0,
        views: data.views || 0,
        likes: Array.isArray(data.likes) ? data.likes.length : 0,
        createdAt: data.createdAt,
        // Store original data for reference but don't spread to avoid overwriting mapped fields
        originalData: data
      };
    });
    
    // Sort reels by createdAt in memory to avoid index requirement
    reels.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return bTime - aTime;
    });

    // Auto-sync user likes if no liked content exists in user_likes collection
    // This helps migrate existing users who may have liked content before the user_likes system
    const likedQuery = query(
      collection(db, 'user_likes'),
      where('userId', '==', userId)
    );
    let likedSnapshot = await getDocs(likedQuery);
    
    // If no likes in user_likes collection, try to sync from content documents
    if (likedSnapshot.empty) {
      try {
        const syncedCount = await syncUserLikes(userId);
        if (syncedCount > 0) {
          console.log(`Auto-synced ${syncedCount} likes for user ${userId}`);
          // Re-fetch the likes after sync
          likedSnapshot = await getDocs(likedQuery);
        }
      } catch (error) {
        console.warn('Auto-sync failed, continuing with empty likes:', error);
      }
    }
    
    // Fetch actual content details for each liked item
    const likedContent = [];
    for (const likeDoc of likedSnapshot.docs) {
      const likeData = likeDoc.data();
      const { contentId, contentType, likedAt } = likeData;
      
      try {
        let contentData = null;
        
        if (contentType === 'look') {
          const lookDoc = await getDoc(doc(db, 'looks', contentId));
          if (lookDoc.exists()) {
            const data = lookDoc.data();
            contentData = {
              id: contentId,
              title: data.caption || 'Untitled Look',
              image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null,
              type: 'Look',
              views: 0, // looks don't have views in current schema
              likes: Array.isArray(data.likes) ? data.likes.length : 0,
              comments: Array.isArray(data.comments) ? data.comments.length : 0,
              createdAt: data.createdAt,
              likedAt: likedAt && likedAt.toDate ? likedAt.toDate() : likedAt,
              originalData: data
            };
          }
        } else if (contentType === 'video' || contentType === 'reel') {
          const videoDoc = await getDoc(doc(db, 'fashiontv_videos', contentId));
          if (videoDoc.exists()) {
            const data = videoDoc.data();
            contentData = {
              id: contentId,
              title: data.caption || 'Untitled Reel',
              thumbnail: data.videoUrl,
              duration: data.duration || 0,
              views: data.views || 0,
              likes: Array.isArray(data.likes) ? data.likes.length : 0,
              type: 'Reel',
              createdAt: data.createdAt,
              likedAt: likedAt && likedAt.toDate ? likedAt.toDate() : likedAt,
              originalData: data
            };
          }
        }
        
        if (contentData) {
          likedContent.push(contentData);
        }
      } catch (error) {
        console.error(`Error fetching liked content ${contentId}:`, error);
        // Continue with other liked content even if one fails
      }
    }
    
    // Sort liked content by likedAt in memory to avoid index requirement
    likedContent.sort((a, b) => {
      const aTime = a.likedAt || new Date(0);
      const bTime = b.likedAt || new Date(0);
      return bTime - aTime;
    });

    // Auto-sync activities if no activities exist in user_activities collection
    // This helps migrate existing users who may have activities before the user_activities system
    const activitiesQuery = query(
      collection(db, 'user_activities'),
      where('userId', '==', userId)
    );
    let activitiesSnapshot = await getDocs(activitiesQuery);
    
    // If no activities in user_activities collection, try to backfill from user activities
    if (activitiesSnapshot.empty) {
      try {
        const backfillCount = await backfillUserActivities(userId);
        if (backfillCount > 0) {
          console.log(`Auto-backfilled ${backfillCount} activities for user ${userId}`);
          // Re-fetch the activities after backfill
          activitiesSnapshot = await getDocs(activitiesQuery);
        }
      } catch (error) {
        console.warn('Auto-backfill failed, continuing with empty activities:', error);
      }
    }
    
    const activities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort activities by timestamp in memory and limit to 50
    activities.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return bTime - aTime;
    });
    
    // Limit to 50 most recent activities
    const limitedActivities = activities.slice(0, 50);

    // Get followers and following counts
    const followersQuery = query(
      collection(db, 'user_follows'),
      where('followingId', '==', userId)
    );
    const followersSnapshot = await getDocs(followersQuery);
    const followers = followersSnapshot.docs.map(doc => doc.data().followerId);

    const followingQuery = query(
      collection(db, 'user_follows'),
      where('followerId', '==', userId)
    );
    const followingSnapshot = await getDocs(followingQuery);
    const following = followingSnapshot.docs.map(doc => doc.data().followingId);

    // Calculate total likes and views
    const totalLikes = looks.reduce((sum, look) => sum + (look.likes || 0), 0) + 
                      reels.reduce((sum, reel) => sum + (reel.likes || 0), 0);
    const totalViews = looks.reduce((sum, look) => sum + (look.views || 0), 0) + 
                      reels.reduce((sum, reel) => sum + (reel.views || 0), 0);

    // Calculate engagement rate
    const totalContent = looks.length + reels.length;
    const engagementRate = totalContent > 0 ? 
      Math.round((totalLikes / (totalViews || 1)) * 100) + '%' : '0%';

    return {
      // Basic user info
      username: userData.name || userData.email?.split('@')[0] || 'User',
      bio: userData.bio || '',
      avatar: userData.photoURL || userData.avatarSeed || null,
      location: userData.location || '',
      website: userData.website || '',
      joinDate: userData.created_at || userData.createdAt || new Date(),
      
      // Social media content
      looks,
      reels,
      likedContent,
      activities: limitedActivities,
      
      // Social stats
      followers,
      following,
      totalLikes,
      totalViews,
      engagementRate,
      
      // Additional stats
      looksCount: looks.length,
      reelsCount: reels.length,
      activitiesCount: activities.length,
      likedContentCount: likedContent.length
    };
  } catch (error) {
    console.error('Error fetching user social data:', error);
    
    // Return empty profile structure if there's an error
    return {
      username: 'User',
      bio: '',
      avatar: null,
      location: '',
      website: '',
      joinDate: new Date(),
      looks: [],
      reels: [],
      likedContent: [],
      activities: [],
      followers: [],
      following: [],
      totalLikes: 0,
      totalViews: 0,
      engagementRate: '0%',
      looksCount: 0,
      reelsCount: 0,
      activitiesCount: 0,
      likedContentCount: 0
    };
  }
};

/**
 * Add a new social media post
 * @param {string} userId - The user's ID
 * @param {Object} postData - The post data
 * @returns {string} The new post ID
 */
export const createSocialPost = async (userId, postData) => {
  try {
    const docRef = await addDoc(collection(db, 'social_posts'), {
      authorId: userId,
      ...postData,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      views: 0
    });

    // Add activity
    await addDoc(collection(db, 'user_activities'), {
      userId,
      type: 'post',
      description: 'Created a new post',
      details: postData.title || 'Untitled post',
      timestamp: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating social post:', error);
    throw error;
  }
};

/**
 * Add a new social media reel
 * @param {string} userId - The user's ID
 * @param {Object} reelData - The reel data
 * @returns {string} The new reel ID
 */
export const createSocialReel = async (userId, reelData) => {
  try {
    const docRef = await addDoc(collection(db, 'social_reels'), {
      authorId: userId,
      ...reelData,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      views: 0
    });

    // Add activity
    await addDoc(collection(db, 'user_activities'), {
      userId,
      type: 'reel',
      description: 'Created a new reel',
      details: reelData.title || 'Untitled reel',
      timestamp: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating social reel:', error);
    throw error;
  }
};

/**
 * Like/unlike content
 * @param {string} userId - The user's ID
 * @param {string} contentId - The content ID
 * @param {string} contentType - The content type (post, reel, etc.)
 * @param {Object} contentInfo - Additional content info for the like record
 * @returns {boolean} True if liked, false if unliked
 */
export const toggleLike = async (userId, contentId, contentType, contentInfo = {}) => {
  try {
    // Check if already liked
    const likeQuery = query(
      collection(db, 'user_likes'),
      where('userId', '==', userId),
      where('contentId', '==', contentId)
    );
    const likeSnapshot = await getDocs(likeQuery);

    if (likeSnapshot.empty) {
      // Add like
      await addDoc(collection(db, 'user_likes'), {
        userId,
        contentId,
        contentType,
        ...contentInfo,
        likedAt: serverTimestamp()
      });

      // Add activity
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'like',
        description: `Liked a ${contentType}`,
        details: contentInfo.title || `${contentType} content`,
        timestamp: serverTimestamp()
      });

      return true;
    } else {
      // Remove like
      const likeDoc = likeSnapshot.docs[0];
      await deleteDoc(doc(db, 'user_likes', likeDoc.id));
      return false;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

/**
 * Follow/unfollow user
 * @param {string} followerId - The follower's user ID
 * @param {string} followingId - The user being followed
 * @returns {boolean} True if followed, false if unfollowed
 */
export const toggleFollow = async (followerId, followingId) => {
  try {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const followQuery = query(
      collection(db, 'user_follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    const followSnapshot = await getDocs(followQuery);

    if (followSnapshot.empty) {
      // Get user info for activity logging
      const followingUserDoc = await getDoc(doc(db, 'users', followingId));
      const followingUserData = followingUserDoc.exists() ? followingUserDoc.data() : null;
      const followingUsername = followingUserData?.name || followingUserData?.email?.split('@')[0] || 'Unknown User';

      // Add follow
      await addDoc(collection(db, 'user_follows'), {
        followerId,
        followingId,
        followedAt: serverTimestamp()
      });

      // Add activity for follower
      await addDoc(collection(db, 'user_activities'), {
        userId: followerId,
        type: 'follow',
        description: `Started following ${followingUsername}`,
        details: followingUsername,
        followingId: followingId,
        followingUsername: followingUsername,
        timestamp: serverTimestamp()
      });

      return true;
    } else {
      // Get user info for activity logging
      const followingUserDoc = await getDoc(doc(db, 'users', followingId));
      const followingUserData = followingUserDoc.exists() ? followingUserDoc.data() : null;
      const followingUsername = followingUserData?.name || followingUserData?.email?.split('@')[0] || 'Unknown User';

      // Remove follow
      const followDoc = followSnapshot.docs[0];
      await deleteDoc(doc(db, 'user_follows', followDoc.id));

      // Add unfollow activity
      await addDoc(collection(db, 'user_activities'), {
        userId: followerId,
        type: 'unfollow',
        description: `Unfollowed ${followingUsername}`,
        details: followingUsername,
        followingId: followingId,
        followingUsername: followingUsername,
        timestamp: serverTimestamp()
      });

      return false;
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
};

/**
 * Backfill activities from existing user content
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} Number of activities created
 */
export const backfillUserActivities = async (userId) => {
  try {
    let activitiesCreated = 0;

    // Check if user already has activities to avoid duplicates
    const existingActivitiesQuery = query(
      collection(db, 'user_activities'),
      where('userId', '==', userId)
    );
    const existingActivitiesSnapshot = await getDocs(existingActivitiesQuery);
    
    if (existingActivitiesSnapshot.docs.length > 0) {
      console.log('User already has activities, skipping backfill');
      return 0;
    }

    // Get user's existing looks
    const looksQuery = query(
      collection(db, 'looks'),
      where('userId', '==', userId)
    );
    const looksSnapshot = await getDocs(looksQuery);
    
    // Create activities for existing looks
    for (const lookDoc of looksSnapshot.docs) {
      const lookData = lookDoc.data();
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'created',
        contentType: 'look',
        lookTitle: lookData.caption || 'Untitled Look',
        lookId: lookDoc.id,
        timestamp: lookData.createdAt || serverTimestamp()
      });
      activitiesCreated++;
    }

    // Get user's existing reels/videos
    const reelsQuery = query(
      collection(db, 'fashiontv_videos'),
      where('userId', '==', userId)
    );
    const reelsSnapshot = await getDocs(reelsQuery);
    
    // Create activities for existing reels
    for (const reelDoc of reelsSnapshot.docs) {
      const reelData = reelDoc.data();
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'created',
        contentType: 'reel',
        reelTitle: reelData.caption || 'Untitled Reel',
        reelId: reelDoc.id,
        timestamp: reelData.createdAt || serverTimestamp()
      });
      activitiesCreated++;
    }

    // Get user's existing likes for looks
    const likedLooksQuery = query(
      collection(db, 'looks'),
      where('likes', 'array-contains', userId)
    );
    const likedLooksSnapshot = await getDocs(likedLooksQuery);
    
    // Create activities for liked looks
    for (const lookDoc of likedLooksSnapshot.docs) {
      const lookData = lookDoc.data();
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'liked',
        contentType: 'look',
        lookTitle: lookData.caption || 'Untitled Look',
        lookId: lookDoc.id,
        timestamp: lookData.updatedAt || lookData.createdAt || serverTimestamp()
      });
      activitiesCreated++;
    }

    // Get user's existing likes for reels/videos
    const likedReelsQuery = query(
      collection(db, 'fashiontv_videos'),
      where('likes', 'array-contains', userId)
    );
    const likedReelsSnapshot = await getDocs(likedReelsQuery);
    
    // Create activities for liked reels
    for (const reelDoc of likedReelsSnapshot.docs) {
      const reelData = reelDoc.data();
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'liked',
        contentType: 'reel',
        reelTitle: reelData.caption || 'Untitled Reel',
        reelId: reelDoc.id,
        timestamp: reelData.updatedAt || reelData.createdAt || serverTimestamp()
      });
      activitiesCreated++;
    }

    console.log(`Backfilled ${activitiesCreated} activities for user ${userId}`);
    return activitiesCreated;
  } catch (error) {
    console.error('Error backfilling activities:', error);
    throw error;
  }
};

/**
 * Update user's social profile
 * @param {string} userId - The user's ID
 * @param {Object} profileData - The profile data to update
 */
export const updateSocialProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), profileData);

    // Add activity
    await addDoc(collection(db, 'user_activities'), {
      userId,
      type: 'profile_update',
      description: 'Updated profile',
      details: 'Profile information updated',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating social profile:', error);
    throw error;
  }
};

/**
 * Get user data by username
 * @param {string} username - The username to search for
 * @returns {Object|null} User data or null if not found
 */
export const getUserByUsername = async (username) => {
  try {
    // Search for user by name (which serves as username in our system)
    const usersQuery = query(
      collection(db, 'users'),
      where('name', '==', username)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      // Also try searching by email prefix (fallback username)
      const allUsersQuery = query(collection(db, 'users'));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      for (const userDoc of allUsersSnapshot.docs) {
        const userData = userDoc.data();
        const emailUsername = userData.email?.split('@')[0];
        if (emailUsername === username) {
          return {
            id: userDoc.id,
            ...userData
          };
        }
      }
      
      return null;
    }
    
    const userDoc = usersSnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

/**
 * Search users by username or name
 * @param {string} searchTerm - The search term
 * @param {number} limitCount - Maximum number of results
 * @returns {Array} Array of user profiles
 */
export const searchUsers = async (searchTerm, limitCount = 20) => {
  try {
    // This is a basic search - for better search functionality, 
    // consider using a search service like Algolia
    const usersQuery = query(
      collection(db, 'users'),
      limit(limitCount)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    const users = usersSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    // Fetch comprehensive user data including followers, looks, and reels
    const usersWithCompleteData = await Promise.all(
      users.map(async (user) => {
        try {
          // Get follower count
          const followersQuery = query(
            collection(db, 'user_follows'),
            where('followingId', '==', user.id)
          );
          const followersSnapshot = await getDocs(followersQuery);
          const followersCount = followersSnapshot.docs.length;
          
          // Get user's looks (limit to 3 for preview)
          const looksQuery = query(
            collection(db, 'looks'),
            where('userId', '==', user.id),
            limit(3)
          );
          const looksSnapshot = await getDocs(looksQuery);
          const looks = looksSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.caption || 'Untitled Look',
              image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null,
              likes: Array.isArray(data.likes) ? data.likes.length : 0
            };
          });
          
          // Get user's reels (limit to 3 for preview)
          const reelsQuery = query(
            collection(db, 'fashiontv_videos'),
            where('userId', '==', user.id),
            limit(3)
          );
          const reelsSnapshot = await getDocs(reelsQuery);
          const reels = reelsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.caption || 'Untitled Reel',
              thumbnail: data.videoUrl,
              likes: Array.isArray(data.likes) ? data.likes.length : 0
            };
          });
          
          return {
            ...user,
            // Fix avatar mapping to match getUserSocialData
            avatar: user.photoURL || user.avatarSeed || null,
            followersCount,
            looks,
            reels,
            looksCount: looksSnapshot.size,
            reelsCount: reelsSnapshot.size
          };
        } catch (error) {
          console.error(`Error fetching data for user ${user.id}:`, error);
          return {
            ...user,
            // Fix avatar mapping to match getUserSocialData
            avatar: user.photoURL || user.avatarSeed || null,
            followersCount: 0,
            looks: [],
            reels: [],
            looksCount: 0,
            reelsCount: 0
          };
        }
      })
    );

    return usersWithCompleteData;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

/**
 * Sync user likes from content documents to user_likes collection
 * This is useful for migrating existing likes to the new system
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} Number of likes synced
 */
export const syncUserLikes = async (userId) => {
  try {
    let syncedCount = 0;
    
    // Check existing user_likes to avoid duplicates
    const existingLikesQuery = query(
      collection(db, 'user_likes'),
      where('userId', '==', userId)
    );
    const existingLikesSnapshot = await getDocs(existingLikesQuery);
    const existingLikedContentIds = new Set(
      existingLikesSnapshot.docs.map(doc => doc.data().contentId)
    );
    
    // Get all looks that user has liked
    const likedLooksQuery = query(
      collection(db, 'looks'),
      where('likes', 'array-contains', userId)
    );
    const likedLooksSnapshot = await getDocs(likedLooksQuery);
    
    // Sync liked looks
    for (const lookDoc of likedLooksSnapshot.docs) {
      const lookId = lookDoc.id;
      
      // Skip if already exists in user_likes
      if (existingLikedContentIds.has(lookId)) {
        continue;
      }
      
      const lookData = lookDoc.data();
      await addDoc(collection(db, 'user_likes'), {
        userId,
        contentId: lookId,
        contentType: 'look',
        title: lookData.caption || 'Untitled Look',
        thumbnail: lookData.images?.[0] || null,
        author: lookData.userId || 'Unknown',
        type: 'Look',
        likedAt: lookData.updatedAt || lookData.createdAt || serverTimestamp()
      });
      
      syncedCount++;
    }
    
    // Get all reels/videos that user has liked
    const likedReelsQuery = query(
      collection(db, 'fashiontv_videos'),
      where('likes', 'array-contains', userId)
    );
    const likedReelsSnapshot = await getDocs(likedReelsQuery);
    
    // Sync liked reels
    for (const reelDoc of likedReelsSnapshot.docs) {
      const reelId = reelDoc.id;
      
      // Skip if already exists in user_likes
      if (existingLikedContentIds.has(reelId)) {
        continue;
      }
      
      const reelData = reelDoc.data();
      await addDoc(collection(db, 'user_likes'), {
        userId,
        contentId: reelId,
        contentType: 'reel',
        title: reelData.caption || 'Untitled Reel',
        thumbnail: reelData.videoUrl,
        author: reelData.userId || 'Unknown',
        type: 'Reel',
        likedAt: reelData.updatedAt || reelData.createdAt || serverTimestamp()
      });
      
      syncedCount++;
    }
    
    console.log(`Synced ${syncedCount} likes for user ${userId}`);
    return syncedCount;
    
  } catch (error) {
    console.error('Error syncing user likes:', error);
    throw error;
  }
};
