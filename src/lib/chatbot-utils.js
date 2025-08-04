import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
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
// import { 
//   ref, 
//   uploadBytes, 
//   getDownloadURL, 
//   deleteObject 
// } from 'firebase/storage';
import { db, storage } from './firebase';




// import { db } from '@/lib/firebase'; // adjust path as needed
// import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

/**
 * Get all looks for the current user
 * @param {string} userId
 * @returns {Promise<Array>} Array of look objects
 */
export const getUserLooks = async (userId) => {
  try {
    const q = query(
      collection(db, 'looks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const looks = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.images?.length > 0) {
        data.images.forEach((image) => {
          looks.push({
            id: doc.id,
            imageUrl: image, // only first image
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        })        
      }
    });

    return looks;
  } catch (err) {
    console.log(err);
    throw new Error('Failed to fetch user looks');
  }
};

/**
 * Get all FashionTV videos for the current user
 * @param {string} userId
 * @returns {Promise<Array>} Array of video objects
 */
export const getUserVideos = async (userId) => {
  try {
    const q = query(
      collection(db, 'fashiontv_videos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const videos = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.videoUrl) {
        videos.push({
          id: doc.id,
          videoUrl: data.videoUrl,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    });

    return videos;
  } catch (err) {
    console.log(err);
    throw new Error('Failed to fetch user videos');
  }
};


/**
 * Save all the msgs to firestore
 * @param {string} userId
 * @returns {Messeges<Array>} Array of chat msgs
 */
export async function saveMessageToFirestore(userId, message) {
  const ref = collection(db, "chatbot", userId, "messages");
  await addDoc(ref, {
    ...message,
    timestamp: new Date()
  });
}

/**
 * Get all the msgs to firestore
 * @param {string} userId
 * @returns {Messeges<Array>} Array of chat msgs
 */
export async function getMessagesFromFirestore(userId) {
  const ref = collection(db, "chatbot", userId, "messages");
  const q = query(ref, orderBy("timestamp", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}