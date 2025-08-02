import { getUserProfile } from './firebase';

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Create a calendar event
export const createCalendarEvent = async (userId, eventData) => {
  try {
    // Get user's Google integration tokens
    const userProfile = await getUserProfile(userId);
    const googleIntegration = userProfile?.googleIntegration;
    
    if (!googleIntegration?.accessToken) {
      throw new Error('Google Calendar not connected');
    }

    const calendarId = googleIntegration.calendarId || 'primary';
    
    // Prepare event data for Google Calendar
    const calendarEvent = {
      summary: `Consultation: ${eventData.type}`,
      description: `
        Consultation Type: ${eventData.type}
        Duration: ${eventData.duration} minutes
        Client: ${eventData.clientId}
        Requirements: ${eventData.requirements || 'None specified'}
        Notes: ${eventData.notes || 'None'}
      `.trim(),
      start: {
        dateTime: eventData.scheduledAt.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(
          eventData.scheduledAt.getTime() + (eventData.duration * 60000)
        ).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        {
          email: userProfile.email,
          responseStatus: 'accepted'
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 }
        ]
      },
      source: {
        title: 'Fashion Hub Consultation',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/consultation/session/${eventData.appointmentId}`
      }
    };

    // Create event in Google Calendar
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleIntegration.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Calendar event creation failed:', errorData);
      
      // If access token expired, try to refresh
      if (response.status === 401 && googleIntegration.refreshToken) {
        const newTokens = await refreshAccessToken(googleIntegration.refreshToken);
        if (newTokens) {
          // Update tokens in Firestore
          await updateGoogleIntegration(userId, newTokens);
          
          // Retry the request with new token
          return createCalendarEvent(userId, eventData);
        }
      }
      
      throw new Error(`Failed to create calendar event: ${errorData.error?.message || 'Unknown error'}`);
    }

    const createdEvent = await response.json();
    return {
      googleEventId: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
      meetingLink: createdEvent.hangoutLink || null
    };

  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update a calendar event
export const updateCalendarEvent = async (userId, googleEventId, eventData) => {
  try {
    const userProfile = await getUserProfile(userId);
    const googleIntegration = userProfile?.googleIntegration;
    
    if (!googleIntegration?.accessToken) {
      throw new Error('Google Calendar not connected');
    }

    const calendarId = googleIntegration.calendarId || 'primary';
    
    const calendarEvent = {
      summary: `Consultation: ${eventData.type}`,
      description: `
        Consultation Type: ${eventData.type}
        Duration: ${eventData.duration} minutes
        Client: ${eventData.clientId}
        Status: ${eventData.status}
        Requirements: ${eventData.requirements || 'None specified'}
        Notes: ${eventData.notes || 'None'}
      `.trim(),
      start: {
        dateTime: eventData.scheduledAt.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(
          eventData.scheduledAt.getTime() + (eventData.duration * 60000)
        ).toISOString(),
        timeZone: 'UTC',
      },
    };

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events/${googleEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${googleIntegration.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Calendar event update failed:', errorData);
      
      if (response.status === 401 && googleIntegration.refreshToken) {
        const newTokens = await refreshAccessToken(googleIntegration.refreshToken);
        if (newTokens) {
          await updateGoogleIntegration(userId, newTokens);
          return updateCalendarEvent(userId, googleEventId, eventData);
        }
      }
      
      throw new Error(`Failed to update calendar event: ${errorData.error?.message || 'Unknown error'}`);
    }

    const updatedEvent = await response.json();
    return {
      googleEventId: updatedEvent.id,
      htmlLink: updatedEvent.htmlLink,
      meetingLink: updatedEvent.hangoutLink || null
    };

  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Delete a calendar event
export const deleteCalendarEvent = async (userId, googleEventId) => {
  try {
    const userProfile = await getUserProfile(userId);
    const googleIntegration = userProfile?.googleIntegration;
    
    if (!googleIntegration?.accessToken) {
      throw new Error('Google Calendar not connected');
    }

    const calendarId = googleIntegration.calendarId || 'primary';

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events/${googleEventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${googleIntegration.accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      console.error('Calendar event deletion failed:', errorData);
      
      if (response.status === 401 && googleIntegration.refreshToken) {
        const newTokens = await refreshAccessToken(googleIntegration.refreshToken);
        if (newTokens) {
          await updateGoogleIntegration(userId, newTokens);
          return deleteCalendarEvent(userId, googleEventId);
        }
      }
      
      throw new Error(`Failed to delete calendar event: ${errorData.error?.message || 'Unknown error'}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh failed:', errorData);
      return null;
    }

    const tokens = await response.json();
    return {
      access_token: tokens.access_token,
      refresh_token: refreshToken, // Keep the existing refresh token
      expires_in: tokens.expires_in,
    };

  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
};

// Get user's calendar list
export const getUserCalendars = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    const googleIntegration = userProfile?.googleIntegration;
    
    if (!googleIntegration?.accessToken) {
      throw new Error('Google Calendar not connected');
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`,
      {
        headers: {
          'Authorization': `Bearer ${googleIntegration.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401 && googleIntegration.refreshToken) {
        const newTokens = await refreshAccessToken(googleIntegration.refreshToken);
        if (newTokens) {
          await updateGoogleIntegration(userId, newTokens);
          return getUserCalendars(userId);
        }
      }
      
      throw new Error(`Failed to get calendars: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.items || [];

  } catch (error) {
    console.error('Error getting user calendars:', error);
    throw error;
  }
};

const googleCalendar = {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUserCalendars,
};

export default googleCalendar;
