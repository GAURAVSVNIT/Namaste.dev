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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
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
        looks.push({
          id: doc.id,
          imageUrl: data.images[0], // only first image
          createdAt: data.createdAt?.toDate() || new Date(),
        });
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


// import { db } from "./firebase";
// import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function saveChatHistory(userId, userMsg, botMsg) {
  const ref = doc(db, "chatHistory", userId);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    await updateDoc(ref, {
      messages: arrayUnion(userMsg, botMsg),
    });
  } else {
    await setDoc(ref, {
      messages: [userMsg, botMsg],
      createdAt: Date.now(),
    });
  }
}

export async function getChatHistory(userId) {
  const ref = doc(db, "chatHistory", userId);
  const docSnap = await getDoc(ref);
  return docSnap.exists() ? docSnap.data().messages : [];
}
