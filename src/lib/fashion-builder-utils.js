import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

/**
 * @param uid: uid of the logged in user
 * @param pngUrl: url of the png image of avatar user created
 */
export async function saveAvatarToFirestore(uid, pngUrl) {
  if (!uid || !pngUrl) return;

  const avatarDocRef = doc(db, "avatars", uid);

  try {
    const docSnap = await getDoc(avatarDocRef);

    if (docSnap.exists()) {
      await updateDoc(avatarDocRef, {
        urls: arrayUnion(pngUrl),
      });
    } 
    else {
      await setDoc(avatarDocRef, {
        urls: [pngUrl],
      });
    }

    console.log("Avatar saved to Firestore:", pngUrl);
  } catch (error) {
    console.error("Failed to save avatar:", error.message);
  }
}

/**
 * @param uid: uid of the logged in user
 * Get all avatar PNG URLs from Firestore for a user.
 * Returns an empty array if the doc doesnt exist or no data found.
 */
export async function getAvatarsFromFirestore(uid) {
  if (!uid) return [];

  const avatarDocRef = doc(db, "avatars", uid);

  try {
    const docSnap = await getDoc(avatarDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data?.urls || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch avatars:", error.message);
    return [];
  }
}
