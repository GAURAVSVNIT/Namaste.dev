'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserAppointments, updateAvailability, updateGoogleIntegration } from '@/lib/consultation-firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Settings, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Video, 
  MessageCircle,
  ExternalLink,
  GoogleIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Schedule</h1>
        <p className="text-gray-600">Manage your consultation bookings and schedule availability</p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Booked Events ({appointments.length})
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Schedule Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-1">Consultation Bookings</h2>
                <p className="text-gray-600">View and manage your upcoming client consultations</p>
              </div>
              <div className="flex items-center gap-4">
                {googleCalendarConnected ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Google Calendar Connected
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGoogleCalendarConnect}
                    disabled={connectingGoogle}
                  >
                    {connectingGoogle ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    Connect Google Calendar
                  </Button>
                )}
                <Button onClick={loadAppointments} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Refresh
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600">Your consultation bookings will appear here once clients book sessions with you.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const consultationType = CONSULTATION_TYPES[appointment.type] || {
                    label: appointment.type,
                    icon: MessageCircle,
                    color: 'bg-gray-100 text-gray-800'
                  };
                  const Icon = consultationType.icon;

                  return (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                Client ID: {appointment.clientId.slice(-8)}
                              </h3>
                              <Badge className={STATUS_COLORS[appointment.status]}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1 capitalize">{appointment.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={consultationType.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {consultationType.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {appointment.duration} minutes
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              ${appointment.pricing?.totalAmount || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.pricing?.currency || 'USD'}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {formatDateTime(appointment.scheduledAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {appointment.duration} minutes
                            </span>
                          </div>
                        </div>
                        
                        {appointment.requirements && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Requirements:</h4>
                            <p className="text-sm text-gray-600">{appointment.requirements}</p>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes:</h4>
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2 border-t">
                          {appointment.status === 'scheduled' && (
                            <Button size="sm" variant="outline">
                              Confirm Appointment
                            </Button>
                          )}
                          {appointment.meetingLink && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Join Meeting
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message Client
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Schedule Management</h2>
              <p className="text-gray-600">Set your availability for client consultations</p>
            </div>

            {/* Google Calendar Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Google Calendar Integration
                </CardTitle>
                <CardDescription>
                  Connect your Google Calendar to automatically sync appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      googleCalendarConnected ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">
                      {googleCalendarConnected ? 'Connected to Google Calendar' : 'Not connected'}
                    </span>
                  </div>
                  {!googleCalendarConnected && (
                    <Button 
                      onClick={handleGoogleCalendarConnect} 
                      disabled={connectingGoogle}
                      size="sm"
                    >
                      {connectingGoogle ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Connect Google Calendar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Manager Component */}
            <ScheduleManager userId={user?.uid} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
