import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
// Type imports removed for JavaScript conversion

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
    authDomain: firebaseConfig.authDomain ? 'SET' : 'MISSING',
    projectId: firebaseConfig.projectId ? 'SET' : 'MISSING',
  });
}

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key is missing');
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ProfileUpdateData interface removed for JavaScript conversion

export const createUser = async (email, password, userData) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const profileToCreate = {
    ...userData,
    email: userCredential.user.email,
    role: userData.role || "user",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  await createUserProfile(
    userCredential.user.uid,
    profileToCreate
  );

  return userCredential;
};

export const signIn = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);

  const userExists = await checkUserExists(userCredential.user.uid);

  if (!userExists) {
    const { user } = userCredential;
    const profileData = {
      email: user.email,
      first_name: user.displayName?.split(" ")[0] || "",
      last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
      avatar_url: user.photoURL,
      role: "user",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    await createUserProfile(user.uid, profileData);
  }

  return userCredential;
};

export const logOut = async () => {
  await signOut(auth);

  try {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (error) {
    console.error("Error clearing server session:", error);
  }
};

export const createUserProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);

  const profileDataToSet = {
    id: userId,
    role: "user",
    ...data,
    created_at:
      data.created_at &&
      (data.created_at instanceof Timestamp ||
        typeof data.created_at === "string")
        ? data.created_at
        : data.created_at || serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  await setDoc(userRef, profileDataToSet);
};

export const checkUserExists = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
};

export const getUserProfile = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  return null;
};

export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);

  const dataToUpdate = {
    ...data,
    id: undefined,
    updated_at: serverTimestamp(),
  };
  delete dataToUpdate.id;

  await updateDoc(userRef, dataToUpdate);
};

export const checkUserIsAdmin = async (userId) => {
  const profile = await getUserProfile(userId);
  return profile?.role === "admin";
};

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const exists = await checkUserExists(user.uid);
        if (!exists) {
          const profileData = {
            email: user.email,
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
            avatar_url: user.photoURL,
            role: "user",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          };
          await createUserProfile(
            user.uid,
            profileData
          );
        }
      } catch (error) {
        console.error(
          "Error ensuring user exists in Firestore (onAuthStateChanged):",
          error
        );
      }
    }
  });
}

export { app, auth, db };

// FirestoreConversationData interface removed for JavaScript conversion

const safeTimestampToDate = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

export const createConversation = async (
  user_id,
  user_email,
  initialMessage
) => {
  const docRef = doc(collection(db, "conversations"));

  const firstEmbeddedMessage = {
    id: initialMessage.id || docRef.id + "_msg_0",
    date: initialMessage.timestamp,
    message: initialMessage.content,
    role: initialMessage.role,
    attachedFiles: initialMessage.attachedFiles || [],
  };

  const conversationData = {
    id: docRef.id,
    user_id,
    user_email,
    messages: [firstEmbeddedMessage],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, conversationData);
  return docRef.id;
};

export const addMessageToConversation = async (
  conversationId,
  message
) => {
  const conversationRef = doc(db, "conversations", conversationId);

  const messageId = message.id || doc(collection(db, "tmp")).id;

  const newMessage = {
    id: messageId,
    date: message.timestamp,
    message: message.content,
    role: message.role,
    attachedFiles: message.attachedFiles || [],
  };

  await updateDoc(conversationRef, {
    messages: arrayUnion(newMessage),
    updatedAt: serverTimestamp(),
  });

  return messageId;
};

export const getConversationsForUser = async (user_id) => {
  const q = query(
    collection(db, "conversations"),
    where("user_id", "==", user_id),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  const conversations = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    conversations.push({
      id: docSnap.id,
      user_id: data.user_id,
      user_email: data.user_email,
      difyConversationId: data.difyConversationId || undefined,
      createdAt: safeTimestampToDate(data.createdAt),
      updatedAt: safeTimestampToDate(data.updatedAt),
    });
  });
  return conversations;
};

export const getAllConversations = async (limitCount = 50) => {
  const q = query(
    collection(db, "conversations"),
    orderBy("updatedAt", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  const conversations = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    conversations.push({
      id: docSnap.id,
      user_id: data.user_id,
      user_email: data.user_email,
      difyConversationId: data.difyConversationId || undefined,
      createdAt: safeTimestampToDate(data.createdAt),
      updatedAt: safeTimestampToDate(data.updatedAt),
    });
  });
  return conversations;
};

export const getConversationWithMessages = async (conversationId) => {
  const conversationRef = doc(db, "conversations", conversationId);
  const docSnap = await getDoc(conversationRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const messages = (data.messages || []).map((msg) => ({
      ...msg,
      date: safeTimestampToDate(msg.date),
    }));

    return {
      id: docSnap.id,
      user_id: data.user_id,
      user_email: data.user_email,
      messages,
      difyConversationId: data.difyConversationId || undefined,
      createdAt: safeTimestampToDate(data.createdAt),
      updatedAt: safeTimestampToDate(data.updatedAt),
    };
  }
  return null;
};

export const deleteConversation = async (conversationId) => {
  const conversationRef = doc(db, "conversations", conversationId);
  await deleteDoc(conversationRef);
};

export const updateConversationDifyId = async (
  firebaseConversationId,
  difyConversationId
) => {
  const conversationRef = doc(db, "conversations", firebaseConversationId);
  await updateDoc(conversationRef, {
    difyConversationId: difyConversationId,
    updatedAt: serverTimestamp(),
  });
};
