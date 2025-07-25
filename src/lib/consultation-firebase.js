import {
  db,
  storage,
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
  arrayUnion,
  arrayRemove
} from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// ============== USER ROLE MANAGEMENT ==============

export const updateUserRole = async (userId, role, additionalData = {}) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      role,
      updated_at: serverTimestamp(),
      ...additionalData
    };

    // Initialize role-specific data
    if (role === 'fashion_designer' || role === 'tailor') {
      updateData.professional = {
        specializations: additionalData.specializations || [],
        experience: additionalData.experience || 0,
        certifications: additionalData.certifications || [],
        languages: additionalData.languages || ['English'],
        workingHours: additionalData.workingHours || getDefaultWorkingHours(),
        bio: additionalData.bio || '',
        location: additionalData.location || {},
        ...additionalData.professional
      };

      updateData.pricing = {
        chatRate: additionalData.chatRate || 0,
        callRate: additionalData.callRate || 0,
        videoCallRate: additionalData.videoCallRate || 0,
        consultationRate: additionalData.consultationRate || 0,
        pricingType: additionalData.pricingType || 'fixed',
        currency: additionalData.currency || 'USD',
        ...additionalData.pricing
      };

      updateData.portfolio = {
        images: [],
        videos: [],
        description: '',
        achievements: [],
        ...additionalData.portfolio
      };

      updateData.rating = {
        average: 0,
        count: 0,
        reviews: []
      };
    }

    await updateDoc(userRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

const getDefaultWorkingHours = () => ({
  monday: { start: '09:00', end: '17:00', available: true },
  tuesday: { start: '09:00', end: '17:00', available: true },
  wednesday: { start: '09:00', end: '17:00', available: true },
  thursday: { start: '09:00', end: '17:00', available: true },
  friday: { start: '09:00', end: '17:00', available: true },
  saturday: { start: '10:00', end: '16:00', available: true },
  sunday: { start: '10:00', end: '16:00', available: false }
});

// ============== PORTFOLIO MANAGEMENT ==============

export const uploadPortfolioImage = async (userId, file, metadata = {}) => {
  try {
    const fileName = `portfolio/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    const imageData = {
      id: Date.now().toString(),
      url: downloadURL,
      fileName: file.name,
      uploadedAt: serverTimestamp(),
      ...metadata
    };

    // Add to user's portfolio
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'portfolio.images': arrayUnion(imageData),
      updated_at: serverTimestamp()
    });

    return imageData;
  } catch (error) {
    console.error('Error uploading portfolio image:', error);
    throw error;
  }
};

export const removePortfolioImage = async (userId, imageId, imageUrl) => {
  try {
    // Remove from storage
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);

    // Remove from user's portfolio
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedImages = userData.portfolio?.images?.filter(img => img.id !== imageId) || [];
      
      await updateDoc(userRef, {
        'portfolio.images': updatedImages,
        updated_at: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing portfolio image:', error);
    throw error;
  }
};

// ============== APPOINTMENT MANAGEMENT ==============

export const createAppointment = async (appointmentData) => {
  try {
    const appointmentRef = doc(collection(db, 'appointments'));
    
    const appointment = {
      id: appointmentRef.id,
      clientId: appointmentData.clientId,
      providerId: appointmentData.providerId,
      providerType: appointmentData.providerType, // 'fashion_designer' or 'tailor'
      type: appointmentData.type, // 'chat', 'call', 'video_call'
      scheduledAt: appointmentData.scheduledAt,
      duration: appointmentData.duration || 30, // minutes
      status: 'scheduled', // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
      pricing: {
        rate: appointmentData.rate,
        type: appointmentData.pricingType,
        currency: appointmentData.currency || 'USD',
        totalAmount: appointmentData.totalAmount
      },
      requirements: appointmentData.requirements || '',
      notes: appointmentData.notes || '',
      googleCalendarEventId: null,
      meetingLink: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(appointmentRef, appointment);

    // Try to create Google Calendar event
    try {
      const { createCalendarEvent } = await import('./googleCalendar');
      const calendarEventData = {
        appointmentId: appointmentRef.id,
        type: appointmentData.type,
        scheduledAt: appointmentData.scheduledAt,
        duration: appointmentData.duration,
        clientId: appointmentData.clientId,
        requirements: appointmentData.requirements,
        notes: appointmentData.notes
      };
      
      const calendarResult = await createCalendarEvent(appointmentData.providerId, calendarEventData);
      
      // Update appointment with Google Calendar info
      await updateDoc(appointmentRef, {
        googleCalendarEventId: calendarResult.googleEventId,
        meetingLink: calendarResult.meetingLink,
        calendarHtmlLink: calendarResult.htmlLink,
        updatedAt: serverTimestamp()
      });
      
      appointment.googleCalendarEventId = calendarResult.googleEventId;
      appointment.meetingLink = calendarResult.meetingLink;
    } catch (calendarError) {
      console.warn('Failed to create Google Calendar event:', calendarError);
      // Continue without calendar integration
    }

    // Create notification for provider
    await createNotification(appointmentData.providerId, {
      type: 'new_appointment',
      title: 'New Appointment Request',
      message: `You have a new ${appointmentData.type} appointment request`,
      data: { appointmentId: appointmentRef.id }
    });

    return appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status, additionalData = {}) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData
    };

    await updateDoc(appointmentRef, updateData);

    // Get appointment details for notifications
    const appointmentDoc = await getDoc(appointmentRef);
    if (appointmentDoc.exists()) {
      const appointment = appointmentDoc.data();
      
      // Notify both client and provider
      const notifications = [];
      
      if (status === 'confirmed') {
        notifications.push(
          createNotification(appointment.clientId, {
            type: 'appointment_confirmed',
            title: 'Appointment Confirmed',
            message: 'Your appointment has been confirmed',
            data: { appointmentId }
          }),
          createNotification(appointment.providerId, {
            type: 'appointment_confirmed',
            title: 'Appointment Confirmed',
            message: 'You confirmed an appointment',
            data: { appointmentId }
          })
        );
      }

      await Promise.all(notifications);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId, userRole = 'client') => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const field = userRole === 'provider' ? 'providerId' : 'clientId';
    
    const q = query(
      appointmentsRef,
      where(field, '==', userId),
      orderBy('scheduledAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const appointments = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        ...data,
        scheduledAt: data.scheduledAt?.toDate?.() || data.scheduledAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

// ============== REAL-TIME CHAT SYSTEM ==============

export const createChatSession = async (appointmentId, participants) => {
  try {
    const chatRef = doc(collection(db, 'chats'));
    
    const chatSession = {
      id: chatRef.id,
      appointmentId,
      participants,
      messages: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(chatRef, chatSession);
    return chatSession;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, senderId, message, type = 'text') => {
  try {
    const messageData = {
      id: Date.now().toString(),
      senderId,
      message,
      type, // 'text', 'image', 'file', 'voice'
      timestamp: serverTimestamp(),
      read: false
    };

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      messages: arrayUnion(messageData),
      updatedAt: serverTimestamp()
    });

    return messageData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToChatMessages = (chatId, callback) => {
  const chatRef = doc(db, 'chats', chatId);
  
  return onSnapshot(chatRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const messages = data.messages?.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate?.() || msg.timestamp
      })) || [];
      
      callback(messages);
    }
  });
};

// ============== GOOGLE SERVICES INTEGRATION ==============

export const updateGoogleIntegration = async (userId, tokens) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      googleIntegration: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        calendarId: tokens.calendarId || 'primary',
        meetEnabled: true,
        driveEnabled: true,
        connectedAt: serverTimestamp()
      },
      updated_at: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating Google integration:', error);
    throw error;
  }
};

// ============== AI ASSISTANT CONFIGURATION ==============

export const updateAIAssistantConfig = async (userId, config) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      aiAssistant: {
        enabled: config.enabled || false,
        personalityType: config.personalityType || 'professional',
        autoRespond: config.autoRespond || false,
        responseDelay: config.responseDelay || 2,
        customPrompts: config.customPrompts || [],
        integrations: {
          n8n: {
            enabled: config.n8n?.enabled || false,
            webhookUrl: config.n8n?.webhookUrl || '',
            apiKey: config.n8n?.apiKey || ''
          },
          google: {
            enabled: config.google?.enabled || false,
            services: config.google?.services || []
          }
        },
        updatedAt: serverTimestamp()
      },
      updated_at: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating AI assistant config:', error);
    throw error;
  }
};

// ============== PRICING MANAGEMENT ==============

export const updatePricingConfig = async (userId, pricingData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pricing: {
        chatRate: pricingData.chatRate || 0,
        callRate: pricingData.callRate || 0,
        videoCallRate: pricingData.videoCallRate || 0,
        consultationRate: pricingData.consultationRate || 0,
        pricingType: pricingData.pricingType || 'fixed',
        currency: pricingData.currency || 'USD',
        specialRates: pricingData.specialRates || {},
        updatedAt: serverTimestamp()
      },
      updated_at: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating pricing config:', error);
    throw error;
  }
};

// ============== SEARCH & DISCOVERY ==============

export const searchProviders = async (filters = {}) => {
  try {
    let q = collection(db, 'users');
    
    // Base query for providers
    const constraints = [
      where('role', 'in', ['fashion_designer', 'tailor'])
    ];

    // Add filters
    if (filters.specialization) {
      constraints.push(where('professional.specializations', 'array-contains', filters.specialization));
    }

    if (filters.city) {
      constraints.push(where('professional.location.city', '==', filters.city));
    }

    if (filters.minRating) {
      constraints.push(where('rating.average', '>=', filters.minRating));
    }

    // Apply constraints
    q = query(q, ...constraints, orderBy('rating.average', 'desc'), limit(20));

    const snapshot = await getDocs(q);
    const providers = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      providers.push({
        id: doc.id,
        ...data,
        // Remove sensitive data
        googleIntegration: undefined,
        aiAssistant: undefined
      });
    });

    return providers;
  } catch (error) {
    console.error('Error searching providers:', error);
    throw error;
  }
};

// ============== NOTIFICATIONS ==============

export const createNotification = async (userId, notificationData) => {
  try {
    const notificationRef = doc(collection(db, 'notifications'));
    
    const notification = {
      id: notificationRef.id,
      userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      read: false,
      createdAt: serverTimestamp()
    };

    await setDoc(notificationRef, notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const constraints = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    ];

    if (unreadOnly) {
      constraints.splice(1, 0, where('read', '==', false));
    }

    const q = query(notificationsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const notifications = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// ============== AVAILABILITY MANAGEMENT ==============

export const updateAvailability = async (userId, workingHours) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'professional.workingHours': workingHours,
      updated_at: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
};

export const checkProviderAvailability = async (providerId, dateTime, duration = 30) => {
  try {
    // Get provider's working hours
    const userRef = doc(db, 'users', providerId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { available: false, reason: 'Provider not found' };
    }

    const userData = userDoc.data();
    const workingHours = userData.professional?.workingHours;
    
    if (!workingHours) {
      return { available: false, reason: 'Working hours not set' };
    }

    // Check if the time falls within working hours
    const date = new Date(dateTime);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const timeString = date.toTimeString().slice(0, 5);
    
    const daySchedule = workingHours[dayName];
    if (!daySchedule || !daySchedule.available) {
      return { available: false, reason: 'Provider not available on this day' };
    }

    if (timeString < daySchedule.start || timeString > daySchedule.end) {
      return { available: false, reason: 'Outside working hours' };
    }

    // Check for existing appointments
    const appointmentsRef = collection(db, 'appointments');
    const startTime = new Date(dateTime);
    const endTime = new Date(dateTime.getTime() + (duration * 60000));
    
    const q = query(
      appointmentsRef,
      where('providerId', '==', providerId),
      where('status', 'in', ['scheduled', 'confirmed', 'in_progress']),
      where('scheduledAt', '>=', Timestamp.fromDate(startTime)),
      where('scheduledAt', '<=', Timestamp.fromDate(endTime))
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { available: false, reason: 'Time slot already booked' };
    }

    return { available: true };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, reason: 'Error checking availability' };
  }
};

export default {
  updateUserRole,
  uploadPortfolioImage,
  removePortfolioImage,
  createAppointment,
  updateAppointmentStatus,
  getUserAppointments,
  createChatSession,
  sendMessage,
  subscribeToChatMessages,
  updateGoogleIntegration,
  updateAIAssistantConfig,
  updatePricingConfig,
  searchProviders,
  createNotification,
  getUserNotifications,
  updateAvailability,
  checkProviderAvailability
};
