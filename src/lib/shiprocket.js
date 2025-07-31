// A hypothetical file for managing Shiprocket logic
// e.g., 'lib/shiprocket.js'

import { adminDb } from '@/app/api/auth/firebase-admin'; // Your initialized Firebase Admin
import { shiprocketLogger } from './logger';

// This is where you'll store your token in Firestore.
const tokenDocRef = adminDb.collection('app_secrets').doc('shiprocket_token');

export async function getValidShiprocketToken() {
  try {
    const tokenDoc = await tokenDocRef.get();
    const tokenData = tokenDoc.data();

    // Check if a token exists and if it's still valid (not expired)
    if (tokenDoc.exists && tokenData.expires_at.toDate() > new Date()) {
      shiprocketLogger.info("Using cached Shiprocket token");
      return tokenData.token;
    }

    // If no token or it's expired, fetch a new one
    shiprocketLogger.info("Fetching new Shiprocket token...");
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_API_EMAIL,
        password: process.env.SHIPROCKET_API_PASSWORD,
      }),
    });

    shiprocketLogger.info("Auth response received", {
      status: response.status,
      statusText: response.statusText
    });

    const authData = await response.json();

    if (!response.ok) {
      shiprocketLogger.error("Failed to authenticate with Shiprocket", {
        status: response.status,
        authData
      });
      throw new Error("Failed to authenticate with Shiprocket");
    }

    // Calculate the expiry date. Shiprocket token is valid for 10 days.
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

    // Save the new token and its expiry date to Firestore
    await tokenDocRef.set({
      token: authData.token,
      expires_at: expiresAt,
    });

    shiprocketLogger.info("New token cached successfully", {
      expiresAt: expiresAt.toISOString()
    });

    return authData.token;
  } catch (error) {
    shiprocketLogger.error("Error in getValidShiprocketToken", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

