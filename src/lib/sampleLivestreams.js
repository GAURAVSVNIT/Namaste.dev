import { addDoc, collection, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Create sample livestream data for testing
 * Only run this once to populate the database
 */
export const createSampleLivestreams = async () => {
  const sampleStreams = [
    {
      title: "Fashion Week 2025 - Live from Paris",
      platform: "youtube",
      url: "https://www.youtube.com/channel/UCqVDpXKJMKONFX3bGMzc7Pw",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCqVDpXKJMKONFX3bGMzc7Pw",
      userId: "sample-user-1",
      userName: "Fashion TV Official",
      userAvatar: null,
      addedBy: "sample-user-1",
      approved: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: "Milan Fashion Show - Live Coverage",
      platform: "youtube", 
      url: "https://www.youtube.com/channel/UCsT0YIqwnpJCM-mx7-gSA4Q",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCsT0YIqwnpJCM-mx7-gSA4Q",
      userId: "sample-user-2",
      userName: "Milan Fashion",
      userAvatar: null,
      addedBy: "sample-user-2",
      approved: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: "New York Fashion Week Live",
      platform: "twitch",
      url: "https://www.twitch.tv/fashionweek",
      embedUrl: "https://www.twitch.tv/fashionweek",
      userId: "sample-user-3",
      userName: "NY Fashion Week",
      userAvatar: null,
      addedBy: "sample-user-3", 
      approved: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: "Designer Runway Show - Live Stream",
      platform: "youtube",
      url: "https://www.youtube.com/channel/UCLXo7UDZvByw2ixzpQCufnA",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCLXo7UDZvByw2ixzpQCufnA",
      userId: "sample-user-4",
      userName: "Designer Studios",
      userAvatar: null,
      addedBy: "sample-user-4",
      approved: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  try {
    const promises = sampleStreams.map(stream => 
      addDoc(collection(db, 'livestreams'), stream)
    );
    
    await Promise.all(promises);
    console.log('Sample livestreams created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample livestreams:', error);
    return false;
  }
};

/**
 * Check if sample data already exists
 */
export const checkSampleDataExists = async () => {
  try {
    const q = query(collection(db, 'livestreams'), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    return false;
  }
};
