import { NextResponse } from 'next/server';
import { updateGoogleIntegration } from '@/lib/consultation-firebase';

export async function GET(request) {
  console.log('🚀 Google OAuth callback started');
  console.log('Request URL:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the user ID
    const error = searchParams.get('error');
    
    console.log('📋 Query parameters:', {
      code: code ? `${code.substring(0, 20)}...` : null,
      state,
      error,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      const errorDescription = searchParams.get('error_description');
      console.error('Error description:', errorDescription);
      return NextResponse.redirect(
        new URL('/fashion-creator-dashboard/events?error=oauth_failed', request.url)
      );
    }

    if (!code || !state) {
      console.error('❌ Missing required parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        new URL('/fashion-creator-dashboard/events?error=missing_params', request.url)
      );
    }
    
    console.log('✅ All required parameters present, proceeding with token exchange');
    console.log('User ID from state:', state);

// Exchange code for tokens
    console.log('🔄 Exchanging code for tokens with Google');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${new URL(request.url).origin}/api/auth/google/callback`,
      }),
    });

if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/fashion-creator-dashboard/events?error=token_exchange_failed', request.url)
      );
    }
    console.log('✅ Token exchange successful');

const tokens = await tokenResponse.json();
    console.log('📥 Tokens received:', { accessToken: tokens.access_token });

    // Store tokens in Firestore
await updateGoogleIntegration(state, tokens);
    console.log('📚 Tokens stored successfully in Firestore');

    // Redirect back to events page with success
    return NextResponse.redirect(
      new URL('/fashion-creator-dashboard/events?success=google_connected', request.url)
    );

  } catch (error) {
console.error('❌ Google Calendar integration error:', error);
    return NextResponse.redirect(
      new URL('/fashion-creator-dashboard/events?error=integration_failed', request.url)
    );
  }
}
