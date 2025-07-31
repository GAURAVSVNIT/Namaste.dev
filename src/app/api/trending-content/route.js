import { NextResponse } from 'next/server';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Function to fetch actual trending data from Firebase
const fetchActualTrendingData = async (sortBy, timeRange) => {
  try {
    const trendingContent = [];
    
    // Calculate time range filter
    const now = new Date();
    const timeRangeMap = {
      day: 1,
      week: 7,
      month: 30,
      all: 365
    };
    
    const daysBack = timeRangeMap[timeRange] || 7;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Fetch looks
    let looksQuery = query(
      collection(db, 'looks'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    if (timeRange !== 'all') {
      looksQuery = query(
        collection(db, 'looks'),
        where('createdAt', '>=', cutoffDate),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    
    const looksSnapshot = await getDocs(looksQuery);
    
    // Process looks and get creator info
    for (const lookDoc of looksSnapshot.docs) {
      const lookData = lookDoc.data();
      
      // Get creator info
      let creatorName = 'Unknown User';
      let isVerified = false;
      
      try {
        if (lookData.userId) {
          const userDoc = await getDoc(doc(db, 'users', lookData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            creatorName = userData.name || userData.email?.split('@')[0] || 'Unknown User';
            isVerified = userData.verified || false;
          }
        }
      } catch (error) {
        console.error('Error fetching creator info:', error);
      }
      
      const likes = Array.isArray(lookData.likes) ? lookData.likes.length : 0;
      const comments = Array.isArray(lookData.comments) ? lookData.comments.length : 0;
      const views = likes * Math.floor(Math.random() * 10) + comments * 5; // Estimate views
      
      trendingContent.push({
        id: lookDoc.id,
        type: 'look',
        title: lookData.caption || 'Untitled Look',
        creator: creatorName,
        image: Array.isArray(lookData.images) && lookData.images.length > 0 ? lookData.images[0] : null,
        views: views,
        likes: likes,
        comments: comments,
        trendingScore: Math.min(100, Math.floor((likes * 2 + comments * 3 + views * 0.1) / 10)),
        isVerified: isVerified,
        tags: Array.isArray(lookData.tags) ? lookData.tags : ['fashion', 'style', 'look'],
        createdAt: lookData.createdAt?.toDate?.() || new Date(lookData.createdAt || Date.now()),
        mood: lookData.mood || null,
        colorPalette: lookData.colorPalette || []
      });
    }
    
    // Fetch reels (fashiontv_videos)
    let reelsQuery = query(
      collection(db, 'fashiontv_videos'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    if (timeRange !== 'all') {
      reelsQuery = query(
        collection(db, 'fashiontv_videos'),
        where('createdAt', '>=', cutoffDate),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    
    const reelsSnapshot = await getDocs(reelsQuery);
    
    // Process reels and get creator info
    for (const reelDoc of reelsSnapshot.docs) {
      const reelData = reelDoc.data();
      
      // Get creator info
      let creatorName = 'Unknown User';
      let isVerified = false;
      
      try {
        if (reelData.userId) {
          const userDoc = await getDoc(doc(db, 'users', reelData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            creatorName = userData.name || userData.email?.split('@')[0] || 'Unknown User';
            isVerified = userData.verified || false;
          }
        }
      } catch (error) {
        console.error('Error fetching creator info:', error);
      }
      
      const likes = Array.isArray(reelData.likes) ? reelData.likes.length : 0;
      const views = reelData.views || (likes * Math.floor(Math.random() * 15) + 100);
      const comments = Math.floor(likes * 0.1) + Math.floor(Math.random() * 20); // Estimate comments
      
      // Fashion/video placeholder images from Unsplash - different for each reel
      const reelPlaceholders = [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1432462770865-65b70566d673?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1520637836862-4d197d17c8a6?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=center'
      ];
      
      // Get a consistent placeholder based on reel ID (so each reel always shows the same placeholder)
      const getPlaceholderForReel = (reelId) => {
        const hash = reelId.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const index = Math.abs(hash) % reelPlaceholders.length;
        return reelPlaceholders[index];
      };
      
      trendingContent.push({
        id: reelDoc.id,
        type: 'reel',
        title: reelData.caption || 'Untitled Reel',
        creator: creatorName,
        image: reelData.thumbnail || reelData.thumbnailUrl || getPlaceholderForReel(reelDoc.id),
        videoUrl: reelData.videoUrl,
        views: views,
        likes: likes,
        comments: comments,
        trendingScore: Math.min(100, Math.floor((likes * 2 + comments * 3 + views * 0.05) / 15)),
        isVerified: isVerified,
        tags: reelData.tags || ['fashion', 'reel', 'video'],
        createdAt: reelData.createdAt?.toDate?.() || new Date(reelData.createdAt || Date.now()),
        duration: reelData.duration || null
      });
    }
    
    return trendingContent;
    
  } catch (error) {
    console.error('Error fetching actual trending data:', error);
    
    // Fallback to a simple mock if Firebase fails
    return [
      {
        id: 'fallback-1',
        type: 'look',
        title: 'Latest Fashion Trends',
        creator: 'Fashion Curator',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
        views: 1250,
        likes: 89,
        comments: 12,
        trendingScore: 75,
        isVerified: false,
        tags: ['fashion', 'trending', 'style'],
        createdAt: new Date()
      }
    ];
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'trending';
    const timeRange = searchParams.get('timeRange') || 'week';

    console.log(`Fetching trending content: sort=${sort}, timeRange=${timeRange}`);

    // Fetch actual trending data from Firebase
    let data = await fetchActualTrendingData(sort, timeRange);

    console.log(`Found ${data.length} trending items`);

    // Apply sorting
    switch (sort) {
      case 'trending':
        data.sort((a, b) => b.trendingScore - a.trendingScore);
        break;
      case 'newest':
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        data.sort((a, b) => b.likes - a.likes);
        break;
      case 'viewed':
        data.sort((a, b) => b.views - a.views);
        break;
      default:
        data.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    // Limit to top 50 results for performance
    data = data.slice(0, 50);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in trending-content API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}
