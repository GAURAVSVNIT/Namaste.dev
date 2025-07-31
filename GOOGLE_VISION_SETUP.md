# Google Vision API Setup Guide

## Current Situation
- Your Firebase project: `fashion-hub-31bce`
- Your Google Cloud project: `golden-furnace-460612-h7`
- These are different projects, which is causing a mismatch

## Option 1: Use Firebase Project (Recommended)

### Step 1: Enable Vision API in Firebase Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project: `fashion-hub-31bce`
3. Go to "APIs & Services" → "Library"
4. Search for "Cloud Vision API"
5. Click on it and press "ENABLE"

### Step 2: Update Environment Variables
Your current setup should work once Vision API is enabled for the Firebase project, since we're using your existing Firebase Admin credentials.

## Option 2: Use Separate Google Cloud Project

If you want to keep using the `golden-furnace-460612-h7` project for Vision API:

### Step 1: Create Service Account for Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `golden-furnace-460612-h7`
3. Go to "IAM & Admin" → "Service Accounts"
4. Click "CREATE SERVICE ACCOUNT"
5. Give it a name like "vision-api-service"
6. Grant it the "Cloud Vision AI User" role
7. Create and download a JSON key

### Step 2: Update Environment Variables
Add the new service account JSON to your `.env.local` file:

```env
# Google Vision API Service Account (separate from Firebase)
GOOGLE_VISION_SERVICE_ACCOUNT={"type": "service_account", ...your downloaded JSON...}
```

### Step 3: Update API Route
Update `src/app/api/visual-search/route.js` to use the separate service account:

```javascript
// Use Google Vision specific credentials if available, otherwise fallback to Firebase
const visionCredentials = process.env.GOOGLE_VISION_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.GOOGLE_VISION_SERVICE_ACCOUNT)
  : JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
```

## Current Status

I've configured the system to use your existing Firebase Admin credentials with the Vision API. You just need to:

1. **Enable Cloud Vision API** for your Firebase project (`fashion-hub-31bce`)
2. **Test the integration** by running your development server

## Testing

1. Start your development server: `pnpm dev`
2. Go to the marketplace page
3. Try uploading an image in the Visual Search component
4. Check the browser console and server logs for any errors

## Troubleshooting

### Common Issues:

1. **"Vision API not enabled"** - Enable it in Google Cloud Console for your project
2. **"Authentication error"** - Make sure your Firebase Admin credentials have the right permissions
3. **"Project mismatch"** - Ensure you're using the correct project ID

### Permissions Needed:
Your Firebase Admin service account needs these roles:
- Cloud Vision AI User (or Editor/Owner)
- Firebase Admin SDK Admin Service Agent (already has this)

Let me know if you encounter any issues!
