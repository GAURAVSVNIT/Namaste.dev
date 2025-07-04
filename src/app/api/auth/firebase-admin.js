import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // First, check if the JSON string is provided as a single environment variable
    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      try {
        const serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
        
        // Make sure private_key is formatted correctly
        if (serviceAccountJson.private_key) {
          serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
        }
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        
        console.log('Firebase Admin initialized with service account JSON string');
      } catch (jsonError) {
        console.error('Error parsing FIREBASE_ADMIN_SERVICE_ACCOUNT:', jsonError);
        throw jsonError;
      }
    } else {
      // Fallback to individual environment variables
      const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      };
      
      // Validate required fields
      const requiredFields = ['project_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter(field => !serviceAccount[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required service account fields: ${missingFields.join(', ')}`);
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      
      console.log('Firebase Admin initialized with individual environment variables');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // For development environment, we can use a fallback configuration
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin initialized with fallback configuration for development');
    } else {
      throw error;
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
