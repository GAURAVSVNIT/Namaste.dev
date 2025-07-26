'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firebase';
import { 
  createAppointment, 
  checkProviderAvailability,
  updateGoogleIntegration 
} from '@/lib/consultation-firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MessageCircle, Phone, Video, CheckCircle, AlertCircle, Loader2, Check, Briefcase, Users, MessageSquare, MapPin, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import ProfileCard from '@/blocks/Components/ProfileCard/ProfileCard';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';

const CONSULTATION_TYPES = [
  { 
    id: 'chat', 
    label: 'Chat Consultation', 
    icon: MessageCircle, 
    description: 'Text-based consultation with file sharing',
    color: 'bg-blue-50 border-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
    hoverColor: 'hover:border-blue-300 hover:bg-blue-50',
    selectedColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
  },
  { 
    id: 'call', 
    label: 'Voice Call', 
    icon: Phone, 
    description: 'Audio-only consultation',
    color: 'bg-purple-50 border-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    hoverColor: 'hover:border-purple-300 hover:bg-purple-50',
    selectedColor: 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
  },
  { 
    id: 'video_call', 
    label: 'Video Call', 
    icon: Video, 
    description: 'Face-to-face video consultation',
    color: 'bg-teal-50 border-teal-100 text-teal-700',
    iconColor: 'text-teal-600',
    hoverColor: 'hover:border-teal-300 hover:bg-teal-50',
    selectedColor: 'border-teal-500 bg-teal-50 ring-2 ring-teal-100'
  }
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [duration, setDuration] = useState(30);
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    loadProvider();
  }, [id]);

  useEffect(() => {
    if (selectedDateTime && duration) {
      checkAvailability();
    }
  }, [selectedDateTime, duration]);

  const loadProvider = async () => {
    try {
      setLoading(true);
      const providerData = await getUserProfile(id);
      if (providerData && (providerData.role === 'fashion_designer' || providerData.role === 'tailor')) {
        setProvider({ id, ...providerData });
      } else {
        toast({
          title: "Provider not found",
          description: "The requested provider could not be found or is not available for consultation.",
          variant: "destructive"
        });
        router.push('/consultation');
      }
    } catch (error) {
      console.error('Error loading provider:', error);
      toast({
        title: "Error",
        description: "Failed to load provider information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!selectedDateTime || !provider) return;
    
    try {
      setCheckingAvailability(true);
      const result = await checkProviderAvailability(
        provider.id, 
        selectedDateTime, 
        duration
      );
      setAvailability(result);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability({ available: false, reason: 'Error checking availability' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleDateTimeSelect = (selectInfo) => {
    const selectedDate = selectInfo.start;
    const now = new Date();
    
    // Don't allow booking in the past
    if (selectedDate < now) {
      toast({
        title: "Invalid Time",
        description: "Cannot book appointments in the past.",
        variant: "destructive"
      });
      return;
    }

    // Don't allow booking too far in the future (90 days)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (selectedDate > maxDate) {
      toast({
        title: "Invalid Time",
        description: "Cannot book appointments more than 90 days in advance.",
        variant: "destructive"
      });
      return;
    }

    setSelectedDateTime(selectedDate);
  };

  const calculateTotalAmount = () => {
    if (!provider || !selectedType || !duration) return 0;
    
    const rate = (provider.pricing?.[`${selectedType}Rate`] || 0) * 83; // Convert USD to INR
    const pricingType = provider.pricing?.pricingType || 'fixed';
    
    if (pricingType === 'per_minute') {
      return rate * duration;
    } else {
      return rate;
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDateTime || !selectedType || !availability?.available) {
      toast({
        title: "Invalid Booking",
        description: "Please select a valid date, time, and consultation type.",
        variant: "destructive"
      });
      return;
    }

    try {
      setBooking(true);
      
      const appointmentData = {
        clientId: user.uid,
        providerId: provider.id,
        providerType: provider.role,
        type: selectedType,
        scheduledAt: selectedDateTime,
        duration,
        rate: provider.pricing?.[`${selectedType}Rate`] || 0,
        pricingType: provider.pricing?.pricingType || 'fixed',
        currency: 'INR',
        totalAmount: calculateTotalAmount(),
        requirements,
        notes
      };

      const appointment = await createAppointment(appointmentData);
      
      toast({
        title: "Appointment Booked!",
        description: "Your consultation has been scheduled successfully.",
      });

      // Redirect to the consultation session or appointments page
      router.push(`/consultation/session/${appointment.id}`);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book the appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBooking(false);
    }
  };

  const getWorkingHoursEvents = () => {
    if (!provider?.professional?.workingHours) return [];
    
    const events = [];
    const workingHours = provider.professional.workingHours;
    
    // Generate working hours for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      const daySchedule = workingHours[dayName];
      if (daySchedule && daySchedule.available) {
        const startTime = new Date(date);
        const [startHour, startMinute] = daySchedule.start.split(':');
        startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        
        const endTime = new Date(date);
        const [endHour, endMinute] = daySchedule.end.split(':');
        endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
        
        events.push({
          title: 'Available',
          start: startTime,
          end: endTime,
          display: 'background',
          backgroundColor: '#e3f2fd',
          classNames: ['available-slot']
        });
      }
    }
    
    return events;
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewProfileProvider, setViewProfileProvider] = useState(null);

  const handleProfileClick = () => {
    setViewProfileProvider(provider);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setViewProfileProvider(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>
              The requested provider could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/consultation')} className="w-full">
              Back to Consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/consultation')}
            className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-transparent px-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Consultation
          </Button>
          
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="relative">
              {/* Header Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-90"></div>
              
              {/* Content */}
              <CardHeader className="relative bg-white/80 backdrop-blur-sm py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Clickable Provider Info Area */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1 cursor-pointer hover:bg-white/60 rounded-lg p-2 -m-2 transition-colors duration-200" onClick={handleProfileClick}>
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                      <Avatar className="relative h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={provider.photoURL} alt={provider.name} className="object-cover" />
                        <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                          {provider.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Provider Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Book with {provider.name}</h1>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                              provider.role === 'fashion_designer' 
                                ? 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}>
                              {provider.role === 'fashion_designer' ? 'Fashion Designer' : 'Master Tailor'}
                            </Badge>
                            
                            {provider.professional?.location?.city && (
                              <div className="flex items-center bg-white/80 px-3 py-1 rounded-full border border-gray-200 text-sm text-gray-700">
                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                <span>{provider.professional.location.city}</span>
                              </div>
                            )}
                            
                            {provider.rating?.average > 0 && (
                              <div className="flex items-center bg-white/80 px-3 py-1 rounded-full border border-gray-200 text-sm">
                                <span className="text-amber-500 font-medium mr-1">{provider.rating.average.toFixed(1)}</span>
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-gray-500 ml-1">({provider.rating.count})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {provider.onlineStatus === 'online' ? (
                            <span className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                              Online Now
                            </span>
                          ) : (
                            <span className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                              <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                              Offline
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {provider.professional?.bio && (
                        <p className="mt-3 text-gray-600 text-sm max-w-3xl">
                          {provider.professional.bio.length > 150 
                            ? `${provider.professional.bio.substring(0, 150)}...` 
                            : provider.professional.bio}
                        </p>
                      )}
                      
                      {/* Click to view profile hint */}
                      <div className="mt-2 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-blue-600 font-medium">👆 Click to view full profile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Stats Bar */}
              <div className="border-t border-gray-100 bg-white/50">
                <div className="px-6 py-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1.5 text-blue-500" />
                    <span>{provider.professional?.experienceYears || '2+'} years experience</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-blue-500" />
                    <span>{provider.professional?.clientsServed || '100+'} clients served</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1.5 text-blue-500" />
                    <span>Speaks {provider.languages?.join(', ') || 'English'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Select Date & Time</h2>
                    <p className="text-sm text-gray-500 mt-1">Choose an available time slot for your appointment</p>
                  </div>
                  {selectedDateTime && (
                    <div className="mt-3 sm:mt-0 bg-blue-50 text-blue-800 text-sm px-3 py-1.5 rounded-full inline-flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {moment(selectedDateTime).format('MMMM D, YYYY [at] h:mm A')}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="calendar-container p-4">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    selectable={true}
                    selectMirror={true}
                    select={handleDateTimeSelect}
                    events={getWorkingHoursEvents()}
                    allDaySlot={false}
                    slotMinTime="06:00:00"
                    slotMaxTime="22:00:00"
                    height="auto"
                    dayHeaderClassNames="text-gray-700 font-medium text-sm"
                    buttonText={{
                      today: 'Today',
                      month: 'Month',
                      week: 'Week',
                      day: 'Day'
                    }}
                    buttonClassNames="text-sm font-medium text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md"
                    headerToolbarClass="space-x-2 p-3 border-b border-gray-100"
                    titleClass="text-lg font-semibold text-gray-800"
                    dayHeaderClass="text-gray-600 text-sm font-medium"
                    nowIndicatorClass="bg-blue-500 h-0.5"
                    businessHours={Object.entries(provider.professional?.workingHours || {}).map(([day, hours]) => ({
                      daysOfWeek: [['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day)],
                      startTime: hours.available ? hours.start : null,
                      endTime: hours.available ? hours.end : null
                    })).filter(bh => bh.startTime)}
                    eventClassNames={['cursor-pointer hover:shadow-md transition-shadow']}
                    dayCellClassNames="hover:bg-gray-50"
                    slotLabelClassNames="text-xs text-gray-500"
                    eventTimeClassNames="text-xs text-gray-600"
                    eventBackgroundColor="#3b82f6"
                    eventBorderColor="#3b82f6"
                    eventTextColor="#ffffff"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-5">
            {/* Selected DateTime */}
            {selectedDateTime && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                  <h3 className="text-lg font-semibold text-gray-800">Selected Time</h3>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {moment(selectedDateTime).format('dddd, MMMM D, YYYY')}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {moment(selectedDateTime).format('h:mm A')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDateTime(null)}
                        className="text-gray-600 hover:bg-gray-100"
                      >
                        Change
                      </Button>
                    </div>
                    
                    {checkingAvailability ? (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-3">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span>Checking availability...</span>
                      </div>
                    ) : availability ? (
                      <div className={`mt-3 p-3 rounded-lg ${
                        availability.available 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-red-50 border border-red-100'
                      }`}>
                        <div className="flex items-start">
                          {availability.available ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          )}
                          <p className={`text-sm ${
                            availability.available ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {availability.available 
                              ? 'This time slot is available for booking.' 
                              : availability.reason}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consultation Type */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Consultation Type</h3>
                <p className="text-sm text-gray-500 mt-1">Choose how you'd like to connect</p>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                  {CONSULTATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const rate = provider.pricing?.[`${type.id}Rate`] || 0;
                    const isSelected = selectedType === type.id;
                    const isAvailable = provider.availableServices?.includes(type.id) !== false;
                    
                    return (
                      <div
                        key={type.id}
                        className={`relative p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? type.selectedColor 
                            : `${type.color} border ${type.hoverColor} hover:shadow-sm`
                        } ${!isAvailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => isAvailable && setSelectedType(type.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2.5 rounded-lg mr-3 ${isSelected ? 'bg-white/80' : 'bg-white/80'} shadow-sm`}>
                            <Icon className={`h-5 w-5 ${isSelected ? type.iconColor : type.iconColor.replace('600', '500')}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`text-base font-semibold ${
                                  isSelected ? 'text-gray-900' : 'text-gray-800'
                                }`}>
                                  {type.label}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {type.description}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <span className={`inline-block text-sm font-semibold ${
                                  isSelected ? 'text-blue-600' : 'text-gray-700'
                                }`}>
                                  ${rate}{provider.pricing?.pricingType === 'per_minute' ? '/min' : ''}
                                </span>
                                {provider.pricing?.pricingType === 'per_minute' && (
                                  <span className="block text-xs text-gray-500">
                                    ~${(rate * (duration / 60)).toFixed(2)} total
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {!isAvailable && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Currently unavailable
                                </span>
                              </div>
                            )}
                            
                            {isSelected && (
                              <div className="absolute -top-2 -right-2">
                                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <Check className="h-3.5 w-3.5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Duration */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Duration</h3>
                <p className="text-sm text-gray-500 mt-1">How long would you like your consultation to be?</p>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DURATION_OPTIONS.map((option) => {
                      const isSelected = duration === option.value;
                      const price = selectedType 
                        ? (provider.pricing?.[`${selectedType}Rate`] || 0) * 
                          (provider.pricing?.pricingType === 'per_minute' ? option.value / 60 : 1) * 
                          (option.value / (provider.pricing?.pricingType === 'per_minute' ? 1 : 60))
                        : 0;
                      
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDuration(option.value)}
                          className={`relative p-3 border rounded-lg text-center transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-100' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2">
                              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {option.label}
                          </div>
                          {selectedType && (
                            <div className="mt-1 text-xs text-gray-500">
                              ${price.toFixed(2)}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="pt-2">
                    <div className="relative">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Duration: {DURATION_OPTIONS.find(d => d.value === duration)?.label}</span>
                        {selectedType && (
                          <span className="font-medium text-blue-600">
                            ${(provider.pricing?.[`${selectedType}Rate`] || 0) * (provider.pricing?.pricingType === 'per_minute' ? duration / 60 : 1) * (duration / (provider.pricing?.pricingType === 'per_minute' ? 1 : 60))}
                          </span>
                        )}
                      </div>
                      <input
                        type="range"
                        min={DURATION_OPTIONS[0].value}
                        max={DURATION_OPTIONS[DURATION_OPTIONS.length - 1].value}
                        step={15}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        {DURATION_OPTIONS.filter((_, i) => i % 2 === 0).map(opt => (
                          <span key={opt.value}>{opt.label}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="font-medium text-gray-600">Tip:</span> Longer consultations allow for more detailed discussions about your project.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Project Details</h3>
                <p className="text-sm text-gray-500 mt-1">What would you like to discuss?</p>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Describe your project, ask questions, or specify what you'd like to achieve..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={4}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500">
                    The more details you provide, the better we can assist you.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Additional Notes</h3>
                <p className="text-sm text-gray-500 mt-1">Any special requests or requirements?</p>
              </CardHeader>
              <CardContent className="p-5">
                <Textarea
                  placeholder="Do you have any specific materials, styles, or preferences you'd like to mention? (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Total Cost */}
            {selectedType && (
              <Card className="border border-blue-100 bg-blue-50 shadow-sm">
                <CardHeader className="border-b border-blue-100 py-4">
                  <h3 className="text-lg font-semibold text-gray-800">Booking Summary</h3>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Consultation Type:</span>
                      <span className="font-medium text-gray-800">
                        {CONSULTATION_TYPES.find(t => t.id === selectedType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-800">
                        {DURATION_OPTIONS.find(d => d.value === duration)?.label}
                      </span>
                    </div>
                    {provider.pricing?.pricingType === 'per_minute' && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rate:</span>
                        <span className="text-gray-800">
                          ${provider.pricing[`${selectedType}Rate`]} per minute
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${calculateTotalAmount().toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider.pricing?.currency || 'USD'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book Button */}
            <div className="pt-2">
              <Button
                className="w-full py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
                disabled={
                  !selectedDateTime || 
                  !selectedType || 
                  !availability?.available || 
                  booking ||
                  checkingAvailability
                }
                onClick={handleBookAppointment}
              >
                {booking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Your Booking...
                  </>
                ) : (
                  <span className="flex items-center justify-center">
                    <span>Book Appointment</span>
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">
                You won't be charged until the provider confirms your appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Modal */}
      {showProfileModal && viewProfileProvider && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50" aria-hidden="true" onClick={closeProfileModal}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <ProfileCard provider={viewProfileProvider} onClose={closeProfileModal} />
          </div>
        </div>
      )}
    </div>
  );
}
