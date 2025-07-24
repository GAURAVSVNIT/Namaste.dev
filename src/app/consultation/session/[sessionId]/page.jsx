'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MoreVertical,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  getConsultationById, 
  subscribeToConsultationMessages, 
  sendConsultationMessage,
  updateConsultationStatus 
} from '@/lib/consultation-firebase';

const ConsultationSessionPage = () => {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const initializeSession = async () => {
      try {
        // Get consultation details
        const consultationData = await getConsultationById(sessionId);
        
        if (!consultationData) {
          console.error('Consultation not found');
          router.push('/consultation');
          return;
        }

        // Check if user has access to this consultation
        if (consultationData.customerId !== user.uid && consultationData.designerId !== user.uid) {
          console.error('Access denied');
          router.push('/consultation');
          return;
        }

        setConsultation(consultationData);
        setMessages(consultationData.messages || []);
        setIsVideoCall(consultationData.type === 'call');

        // Subscribe to real-time messages
        unsubscribeRef.current = subscribeToConsultationMessages(sessionId, (updatedConsultation) => {
          setConsultation(updatedConsultation);
          setMessages(updatedConsultation.messages || []);
        });

        // Start session if not already started
        if (consultationData.status === 'pending') {
          await updateConsultationStatus(sessionId, 'active');
          setSessionStarted(true);
          startSessionTimer();
        } else if (consultationData.status === 'active') {
          setSessionStarted(true);
          startSessionTimer();
        }

        // Send welcome message from designer if this is the first time
        if ((!consultationData.messages || consultationData.messages.length === 0) && 
            consultationData.designerId === user.uid) {
          setTimeout(async () => {
            await sendConsultationMessage(
              sessionId,
              user.uid,
              `Hello! I'm ${consultationData.designerName}. Thank you for booking a consultation with me. How can I help you today?`,
              consultationData.designerName
            );
          }, 1000);
        }

      } catch (error) {
        console.error('Error initializing session:', error);
        router.push('/consultation');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId, user, isAuthenticated, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSessionTimer = () => {
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const senderName = consultation?.customerId === user.uid 
        ? consultation?.customerName || 'Customer'
        : consultation?.designerName || 'Designer';

      await sendConsultationMessage(sessionId, user.uid, messageText, senderName);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For demo purposes, we'll just send a message about the file
      handleSendMessage({
        preventDefault: () => {},
        target: { value: `📎 Shared: ${file.name}` }
      });
    }
  };

  const endSession = async () => {
    try {
      await updateConsultationStatus(sessionId, 'completed');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      router.push('/consultation');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCustomer = consultation?.customerId === user.uid;
  const isDesigner = consultation?.designerId === user.uid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation session...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Session Not Found</h1>
          <Button onClick={() => router.push('/consultation')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Consultations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/consultation')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={isCustomer 
                      ? 'https://images.unsplash.com/photo-1494790108755-2616b1e2f48e?w=50&h=50&fit=crop&crop=face'
                      : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {isCustomer ? consultation.designerName : consultation.customerName}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant={consultation.type === 'call' ? 'default' : 'secondary'} className="text-xs">
                      {consultation.type === 'call' ? 'Video Call' : 'Chat'}
                    </Badge>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(sessionTimer)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {consultation.type === 'call' && (
                <>
                  <Button variant="ghost" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={endSession}
                className="bg-red-500 hover:bg-red-600"
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col shadow-xl border-0">
              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <div className="space-y-4 max-w-4xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isMyMessage = message.senderId === user.uid;
                      const messageTime = message.timestamp?.toDate?.() || new Date();
                      
                      return (
                        <motion.div
                          key={message.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            isMyMessage 
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${
                                isMyMessage ? 'text-pink-100' : 'text-gray-500'
                              }`}>
                                {message.senderName}
                              </span>
                              <span className={`text-xs ${
                                isMyMessage ? 'text-pink-100' : 'text-gray-400'
                              }`}>
                                {messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">typing...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                    disabled={sending}
                  />

                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sending}
                    className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-6"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Session Info Sidebar */}
          <div className="space-y-6">
            {/* Session Details */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Session Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant={consultation.type === 'call' ? 'default' : 'secondary'}>
                      {consultation.type === 'call' ? 'Video Call' : 'Chat'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formatTime(sessionTimer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={consultation.status === 'active' ? 'default' : 'secondary'}>
                      {consultation.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₹{consultation.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {consultation.requirements && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Requirements</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {consultation.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Share Image
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Chat
                  </Button>
                  {isCustomer && (
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Rate Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSessionPage;
