'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserAppointments } from '@/lib/consultation-firebase';
import { toast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Video, 
  MessageCircle,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import ScheduleManager from '@/components/fashion-creator/ScheduleManager';

const CONSULTATION_TYPES = {
  chat: { label: 'Chat Consultation', icon: MessageCircle, color: 'bg-blue-100 text-blue-800' },
  call: { label: 'Voice Call', icon: Phone, color: 'bg-green-100 text-green-800' },
  video_call: { label: 'Video Call', icon: Video, color: 'bg-purple-100 text-purple-800' }
};

const STATUS_COLORS = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function EventsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const userAppointments = await getUserAppointments(user.uid, 'provider');
      setAppointments(userAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleCalendarConnect = async () => {
    try {
      setConnectingGoogle(true);
      
      // Debug logging
      console.log('🔍 Starting Google Calendar OAuth flow');
      console.log('🔍 User ID:', user?.uid);
      console.log('🔍 Current origin:', window.location.origin);
      console.log('🔍 Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
      
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID is not configured');
      }
      
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      const redirectUri = window.location.origin + '/api/auth/google/callback';
      console.log('🔍 Redirect URI:', redirectUri);
      
      // Google OAuth flow - this would redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${user.uid}`;
      
      console.log('🔗 OAuth URL:', googleAuthUrl);
      console.log('🚀 Redirecting to Google OAuth...');
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('❌ Error connecting Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Google Calendar. Please try again.",
        variant: "destructive"
      });
      setConnectingGoogle(false);
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      const date = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
      return format(date, 'MMM d, yyyy \\at h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Professional inline styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const tabsContainerStyle = {
    width: '100%',
    marginBottom: '2rem'
  };

  const tabsListStyle = {
    display: 'flex',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '0.5rem',
    marginBottom: '2rem',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
  };

  const tabTriggerStyle = {
    flex: 1,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '0.95rem',
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const activeTabStyle = {
    ...tabTriggerStyle,
    backgroundColor: 'white',
    color: '#6366f1',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    marginBottom: '1.5rem',
    overflow: 'hidden'
  };

  const cardHoverStyle = {
    ...cardStyle,
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)'
  };

  const cardHeaderStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid #f3f4f6'
  };

  const cardContentStyle = {
    padding: '1.5rem'
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: '500',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6366f1',
    color: 'white',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#4b5563',
    border: '1px solid #d1d5db'
  };

  const ghostButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none'
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    lineHeight: '1'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  };

  const loadingCardStyle = {
    ...cardStyle,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  const appointmentGridStyle = {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: '1fr'
  };

  const appointmentCardStyle = {
    ...cardStyle,
    cursor: 'pointer'
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = { ...badgeStyle };
    switch (status) {
      case 'scheduled':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'confirmed':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'in_progress':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getConsultationBadgeStyle = (type) => {
    const baseStyle = { ...badgeStyle };
    switch (type) {
      case 'chat':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'call':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'video_call':
        return { ...baseStyle, backgroundColor: '#f3e8ff', color: '#7c3aed' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        {/* Custom Tabs Header */}
        <div style={tabsListStyle}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={activeTab === 'appointments' ? activeTabStyle : tabTriggerStyle}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            style={activeTab === 'schedule' ? activeTabStyle : tabTriggerStyle}
          >
            Schedule
          </button>
        </div>

        {/* Appointments Tab Content */}
        {activeTab === 'appointments' && (
          <div style={{ marginTop: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={cardStyle}>
                <div style={cardContentStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>Upcoming Appointments</h2>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>Manage your upcoming consultations</p>
                    </div>
                    <button 
                      onClick={loadAppointments} 
                      disabled={loading}
                      style={{
                        ...primaryButtonStyle,
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading && <Loader2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />}
                      Refresh
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {googleCalendarConnected ? (
                      <div style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#166534' }}>
                        <CheckCircle style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                        Google Calendar Connected
                      </div>
                    ) : (
                      <button 
                        onClick={handleGoogleCalendarConnect}
                        disabled={connectingGoogle}
                        style={{
                          ...outlineButtonStyle,
                          fontSize: '0.8125rem',
                          padding: '0.5rem 0.875rem',
                          opacity: connectingGoogle ? 0.6 : 1,
                          cursor: connectingGoogle ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {connectingGoogle ? (
                          <Loader2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <ExternalLink style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        )}
                        Connect Google Calendar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={loadingCardStyle}>
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '25%', marginBottom: '1rem' }}></div>
                        <div style={{ height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '50%', marginBottom: '0.5rem' }}></div>
                        <div style={{ height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '75%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div style={cardStyle}>
                  <div style={emptyStateStyle}>
                    <Calendar style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', margin: '0 0 0.5rem 0' }}>No appointments yet</h3>
                    <p style={{ color: '#6b7280', margin: '0' }}>Your consultation bookings will appear here once clients book sessions with you.</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {appointments.map((appointment) => {
                    const consultationType = CONSULTATION_TYPES[appointment.type] || {
                      label: appointment.type,
                      icon: MessageCircle,
                      color: 'bg-gray-100 text-gray-800'
                    };
                    const Icon = consultationType.icon;

                    return (
                      <div 
                        key={appointment.id} 
                        style={appointmentCardStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={cardHeaderStyle}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0', color: '#111827' }}>
                                  Client ID: {appointment.clientId.slice(-8)}
                                </h3>
                                <div style={getStatusBadgeStyle(appointment.status)}>
                                  {getStatusIcon(appointment.status)}
                                  <span style={{ marginLeft: '0.25rem', textTransform: 'capitalize' }}>
                                    {appointment.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={getConsultationBadgeStyle(appointment.type)}>
                                  <Icon style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                                  {consultationType.label}
                                </div>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                  {appointment.duration} minutes
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669', margin: '0' }}>
                                ${appointment.pricing?.totalAmount || 0}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                                {appointment.pricing?.currency || 'USD'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div style={{ ...cardContentStyle, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                              <span style={{ fontSize: '0.875rem' }}>
                                {formatDateTime(appointment.scheduledAt)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Clock style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                              <span style={{ fontSize: '0.875rem' }}>
                                {appointment.duration} minutes
                              </span>
                            </div>
                          </div>
                          
                          {appointment.requirements && (
                            <div>
                              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 0.25rem 0', color: '#374151' }}>Requirements:</h4>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>{appointment.requirements}</p>
                            </div>
                          )}
                          
                          {appointment.notes && (
                            <div>
                              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 0.25rem 0', color: '#374151' }}>Notes:</h4>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>{appointment.notes}</p>
                            </div>
                          )}
                          
                          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
                            {appointment.status === 'scheduled' && (
                              <button style={{
                                ...outlineButtonStyle,
                                fontSize: '0.8125rem',
                                padding: '0.5rem 0.875rem'
                              }}>
                                Confirm Appointment
                              </button>
                            )}
                            {appointment.meetingLink && (
                              <a 
                                href={appointment.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  ...outlineButtonStyle,
                                  fontSize: '0.8125rem',
                                  padding: '0.5rem 0.875rem'
                                }}
                              >
                                <ExternalLink style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                                Join Meeting
                              </a>
                            )}
                            <button style={{
                              ...ghostButtonStyle,
                              fontSize: '0.8125rem',
                              padding: '0.5rem 0.875rem'
                            }}>
                              <MessageCircle style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                              Message Client
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab Content */}
        {activeTab === 'schedule' && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: '#111827' }}>Schedule Management</h2>
                <p style={{ color: '#6b7280', margin: '0' }}>Set your availability for client consultations</p>
              </div>

              {/* Google Calendar Integration */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ExternalLink style={{ width: '1.25rem', height: '1.25rem', color: '#6366f1' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0', color: '#111827' }}>Google Calendar Integration</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>
                    Connect your Google Calendar to automatically sync appointments
                  </p>
                </div>
                <div style={cardContentStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        borderRadius: '50%',
                        backgroundColor: googleCalendarConnected ? '#10b981' : '#9ca3af'
                      }}></div>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {googleCalendarConnected ? 'Connected to Google Calendar' : 'Not connected'}
                      </span>
                    </div>
                    {!googleCalendarConnected && (
                      <button 
                        onClick={handleGoogleCalendarConnect} 
                        disabled={connectingGoogle}
                        style={{
                          ...primaryButtonStyle,
                          fontSize: '0.8125rem',
                          padding: '0.5rem 0.875rem',
                          opacity: connectingGoogle ? 0.6 : 1,
                          cursor: connectingGoogle ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {connectingGoogle ? (
                          <Loader2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <ExternalLink style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        )}
                        Connect Google Calendar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Manager Component */}
              <div style={cardStyle}>
                <div style={cardContentStyle}>
                  <ScheduleManager userId={user?.uid} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
