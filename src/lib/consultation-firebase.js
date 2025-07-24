import { 
  db, 
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
} from './firebase';

// Consultation Management Functions
export async function createConsultation(consultationData) {
  const consultation = {
    ...consultationData,
    status: 'pending', // pending, active, completed, cancelled
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messages: [], // For real-time chat
    totalAmount: consultationData.price || 0,
    sessionDuration: 0, // Track actual session time
  };
  const docRef = await addDoc(collection(db, 'consultations'), consultation);
  return docRef.id;
}

export async function updateConsultationStatus(consultationId, status) {
  const consultationRef = doc(db, 'consultations', consultationId);
  await updateDoc(consultationRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getConsultationById(consultationId) {
  const consultationRef = doc(db, 'consultations', consultationId);
  const consultationSnap = await getDoc(consultationRef);
  if (consultationSnap.exists()) {
    return { id: consultationSnap.id, ...consultationSnap.data() };
  }
  return null;
}

// Designer/Consultant Management Functions
export async function addDesigner(designerData) {
  const designer = {
    ...designerData,
    role: 'designer', // designer, stylist, tailor
    isAvailable: true,
    rating: 4.5, // Default rating
    totalConsultations: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'designers'), designer);
  return docRef.id;
}

export async function getAvailableDesigners() {
  const designersQuery = query(
    collection(db, 'designers'),
    where('isAvailable', '==', true),
    orderBy('rating', 'desc')
  );
  const snapshot = await getDocs(designersQuery);
  const designers = [];
  snapshot.forEach(doc => {
    designers.push({ id: doc.id, ...doc.data() });
  });
  return designers;
}

export async function getDesignerById(designerId) {
  const designerRef = doc(db, 'designers', designerId);
  const designerSnap = await getDoc(designerRef);
  if (designerSnap.exists()) {
    return { id: designerSnap.id, ...designerSnap.data() };
  }
  return null;
}

// Real-time Chat Functions for Consultations
export async function sendConsultationMessage(consultationId, senderId, message, senderName) {
  const consultationRef = doc(db, 'consultations', consultationId);
  const consultationSnap = await getDoc(consultationRef);
  
  if (consultationSnap.exists()) {
    const newMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
      read: false
    };
    
    await updateDoc(consultationRef, {
      messages: arrayUnion(newMessage),
      lastMessage: message,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return newMessage.id;
  }
}

export function subscribeToConsultationMessages(consultationId, callback) {
  const consultationRef = doc(db, 'consultations', consultationId);
  
  return onSnapshot(consultationRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        id: doc.id,
        ...data,
        messages: data.messages || []
      });
    }
  });
}

// Get consultations for a user (customer)
export async function getConsultationsForUser(userId) {
  const consultationsQuery = query(
    collection(db, 'consultations'),
    where('customerId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(consultationsQuery);
  const consultations = [];
  snapshot.forEach(doc => {
    consultations.push({ id: doc.id, ...doc.data() });
  });
  return consultations;
}

// Get consultations for a designer
export async function getConsultationsForDesigner(designerId) {
  const consultationsQuery = query(
    collection(db, 'consultations'),
    where('designerId', '==', designerId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(consultationsQuery);
  const consultations = [];
  snapshot.forEach(doc => {
    consultations.push({ id: doc.id, ...doc.data() });
  });
  return consultations;
}

// Real-time subscription for user's consultations
export function subscribeToUserConsultations(userId, callback, role = 'customer') {
  const field = role === 'customer' ? 'customerId' : 'designerId';
  const consultationsQuery = query(
    collection(db, 'consultations'),
    where(field, '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(10)
  );
  
  return onSnapshot(consultationsQuery, snapshot => {
    const consultations = [];
    snapshot.forEach(doc => {
      consultations.push({ id: doc.id, ...doc.data() });
    });
    callback(consultations);
  });
}

// Payment Integration Functions
export async function createConsultationPayment(consultationId, paymentData) {
  const payment = {
    consultationId,
    ...paymentData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'consultation_payments'), payment);
  return docRef.id;
}

export async function updateConsultationPaymentStatus(paymentId, status, razorpayData = {}) {
  const paymentRef = doc(db, 'consultation_payments', paymentId);
  await updateDoc(paymentRef, {
    status,
    ...razorpayData,
    updatedAt: serverTimestamp(),
  });
}

// Dashboard Stats for Designers
export async function getDesignerStats(designerId) {
  const consultationsQuery = query(
    collection(db, 'consultations'),
    where('designerId', '==', designerId),
    where('status', '==', 'completed')
  );
  
  const snapshot = await getDocs(consultationsQuery);
  let totalEarnings = 0;
  let totalConsultations = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    totalEarnings += data.totalAmount || 0;
    totalConsultations += 1;
  });
  
  return {
    totalEarnings,
    totalConsultations,
    averageEarning: totalConsultations > 0 ? totalEarnings / totalConsultations : 0
  };
}
