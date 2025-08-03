import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
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
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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
const storage = getStorage(app);
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
    role: userData.role || "member",
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
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const { user } = userCredential;
    
    // Important: Google provides a verified email by default, but we check anyway
    if (user.email) {
      const userExists = await checkUserExists(user.uid);
      
      // For brand new users, we need to create their profile
      if (!userExists) {
        const profileData = {
          email: user.email,
          name: user.displayName || "",
          first_name: user.displayName?.split(" ")[0] || "",
          last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
          photoURL: user.photoURL,
          avatar_url: user.photoURL, // Keep both for compatibility
          role: "member",
          likedBlogs: [],
          activity: [],
          blogCount: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          last_sign_in_at: serverTimestamp(),
        };
        await createUserProfile(user.uid, profileData);
        
        // For new Google users, redirect to onboarding
        window.location.href = `/onboarding`;
        return userCredential;
      }
      
      // Update the user's last sign-in time
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        last_sign_in_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }
    
    // For existing users, proceed to normal flow
    const idToken = await user.getIdToken();
    const redirectUrl = `/api/auth/callback?token=${idToken}`;
    window.location.href = redirectUrl;
    
    return userCredential;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
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

  // Initialize with multiavatar if no photoURL provided
  let avatarData = {};
  if (!data.photoURL) {
    try {
      const { generateUserMultiavatar } = await import('./multiavatar');
      const multiavatar = generateUserMultiavatar(data);
      avatarData = {
        photoURL: multiavatar.dataUrl,
        avatarSeed: multiavatar.seed
      };
    } catch (error) {
      console.error('Error generating initial multiavatar:', error);
      // Continue without avatar if generation fails
    }
  }

  const profileDataToSet = {
    id: userId,
    role: data.role || "member",
    ...data,
    ...avatarData, // Add multiavatar data if generated
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

// Alias for getUserProfile for backward compatibility
export const getUserById = getUserProfile;

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
            name: user.displayName || "",
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
            photoURL: user.photoURL,
            avatar_url: user.photoURL, // Keep both for compatibility
            role: "member",
            likedBlogs: [],
            activity: [],
            blogCount: 0,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            last_sign_in_at: serverTimestamp(),
          };
          await createUserProfile(
            user.uid,
            profileData
          );
          
          // For new users who signed in with Google but haven't verified email yet
          if (user.email && !user.emailVerified && user.providerData.some(p => p.providerId === 'google.com')) {
            console.log('New Google user, auto-redirecting to verification flow');
            // Don't auto-send email verification for Google users, just redirect to verify page
            window.location.href = `/auth/verify?email=${encodeURIComponent(user.email)}`;
          }
        } else {
          // Update last sign in for existing users
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            last_sign_in_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
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

export async function addProduct(product) {
  const productData = {
    ...product,
    price: parseFloat(product.price),
    stock: parseInt(product.stock, 10),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'products'), productData);
  return docRef.id;
}

export async function updateProduct(productId, product) {
  // Validate productId
  if (!productId || typeof productId !== 'string') {
    throw new Error(`Invalid productId: ${productId}. Must be a non-empty string.`);
  }
  
  // Validate product data
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product data. Must be an object.');
  }
  
  console.log('updateProduct called with:', { productId, product });
  
  try {
    const productRef = doc(db, 'products', productId);
    const productData = {
      ...product,
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock, 10) || 0,
      updatedAt: serverTimestamp(),
    };
    
    console.log('Updating product with data:', productData);
    await updateDoc(productRef, productData);
    console.log('Product updated successfully');
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, 'products', productId));
}

export function subscribeToRealtimeStats(update) {
  return onSnapshot(collection(db, 'stats'), snapshot => {
    const stats = [];
    snapshot.forEach(doc => {
      stats.push({ id: doc.id, ...doc.data() });
    });
    update(stats);
  });
}

export function subscribeToRealtimeOrders(update) {
  const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(orderQuery, snapshot => {
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    update(orders);
  });
}

export { 
  app, 
  auth, 
  db, 
  storage,
  // Firestore functions
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  arrayUnion
};

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
