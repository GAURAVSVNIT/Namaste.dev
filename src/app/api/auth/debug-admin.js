import admin from 'firebase-admin';

// Function to check the service account values
export default function checkServiceAccount() {
  const serviceAccount = {
    type: process.env.FIREBASE_ADMIN_TYPE,
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
    token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  };

  // Check for missing or empty values
  const missingKeys = [];
  Object.entries(serviceAccount).forEach(([key, value]) => {
    if (!value) {
      missingKeys.push(key);
    }
  });

  return {
    missing: missingKeys,
    project_id_present: !!serviceAccount.project_id,
    project_id_value_type: typeof serviceAccount.project_id,
    project_id_value: serviceAccount.project_id ? `${serviceAccount.project_id.substring(0, 3)}...` : null,
  };
}
