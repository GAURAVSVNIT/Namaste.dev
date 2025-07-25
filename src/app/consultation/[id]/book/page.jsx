'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MessageCircle,
  Video,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { createConsultation, createConsultationPayment, updateConsultationPaymentStatus } from '@/lib/consultation-firebase';

const BookingPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type'); // 'chat' or 'call'
  const { user, isAuthenticated } = useAuth();

  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    requirements: '',
    urgency: 'normal'
  });

  // Demo designer data (matching the main page)
  const demoDesigners = {
    'designer_1': {
      id: 'designer_1',
      name: 'Priya Sharma',
      speciality: ['Traditional Indian Wear', 'Bridal Fashion'],
      bio: 'Award-winning designer specializing in contemporary Indian fashion with 8+ years of experience.',
      chatPrice: 299,
      callPrice: 599,
      rating: 4.9,
      totalConsultations: 156,
      responseTime: '< 5 mins',
      languages: ['Hindi', 'English'],
      image: 'https://images.unsplash.com/photo-1494790108755-2616b1e2f48e?w=200&h=200&fit=crop&crop=face',
      isAvailable: true,
      badges: ['Top Rated', 'Quick Response']
    },
    'designer_2': {
      id: 'designer_2',
      name: 'Arjun Singh',
      speciality: ['Men\'s Fashion', 'Formal Wear'],
      bio: 'Celebrity stylist and fashion consultant for Bollywood stars. Expert in modern menswear.',
      chatPrice: 199,
      callPrice: 399,
      rating: 4.7,
      totalConsultations: 89,
      responseTime: '< 10 mins',
      languages: ['Hindi', 'English', 'Punjabi'],
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      isAvailable: true,
      badges: ['Celebrity Stylist']
    },
    'designer_3': {
      id: 'designer_3',
      name: 'Neha Gupta',
      speciality: ['Western Wear', 'Party Outfits'],
      bio: 'Fashion blogger turned consultant. Specializes in trendy western outfits and party wear.',
      chatPrice: 149,
      callPrice: 299,
      rating: 4.8,
      totalConsultations: 234,
      responseTime: '< 3 mins',
      languages: ['Hindi', 'English'],
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      isAvailable: true,
      badges: ['Fashion Blogger', 'Trending Expert']
    }
  };

  useEffect(() => {
    // For demo, use static data
    const designerData = demoDesigners[id];
    if (designerData) {
      setDesigner(designerData);
    }
    setLoading(false);

    // Set default date to today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0]
    }));
  }, [id]);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePrice = () => {
    if (!designer) return 0;
    const basePrice = type === 'chat' ? designer.chatPrice : designer.callPrice;
    const urgencyMultiplier = formData.urgency === 'urgent' ? 1.5 : 1;
    return Math.round(basePrice * urgencyMultiplier);
  };

  const handleBookConsultation = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!formData.date || !formData.time) {
      alert('Please select date and time');
      return;
    }

    setProcessing(true);

    try {
      const consultationData = {
        customerId: user.uid,
        customerName: user.displayName || user.email,
        designerId: designer.id,
        designerName: designer.name,
        type: type, // 'chat' or 'call'
        scheduledAt: `${formData.date}T${formData.time}:00Z`,
        requirements: formData.requirements,
        urgency: formData.urgency,
        price: calculatePrice(),
        duration: type === 'chat' ? 30 : 60, // minutes
      };

      // Create consultation record
      const consultationId = await createConsultation(consultationData);

      // Create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculatePrice(),
          currency: 'INR',
          receipt: `consultation_${consultationId}_${Date.now()}`,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const { orderId: razorpayOrderId, amount } = await orderResponse.json();

      // Create payment record
      const paymentId = await createConsultationPayment(consultationId, {
        amount: calculatePrice(),
        currency: 'INR',
        razorpayOrderId,
        customerId: user.uid,
        designerId: designer.id,
      });

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Fashion Hub Consultation',
        description: `${type === 'chat' ? 'Chat' : 'Video Call'} with ${designer.name}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              // Update payment status
              await updateConsultationPaymentStatus(paymentId, 'completed', {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              // Redirect to session page
              router.push(`/consultation/session/${consultationId}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.displayName || 'Customer',
          email: user.email,
        },
        theme: {
          color: '#ec4899',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
            setProcessing(false);
          }
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay not loaded');
      }

    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book consultation. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse bg-white rounded-2xl p-8 shadow-xl">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Designer Not Found</h1>
          <Button onClick={() => router.push('/consultation')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Consultants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 mt-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Book {type === 'chat' ? 'Chat' : 'Video Call'} Session
            </h1>
            <p className="text-gray-600">with {designer.name}</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  {type === 'chat' ? <MessageCircle className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  Consultation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      Preferred Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      Preferred Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <Label className="mb-3 block">Session Priority</Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'normal', label: 'Normal', desc: 'Standard consultation' },
                      { value: 'urgent', label: 'Urgent', desc: '+50% fee for priority scheduling' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleInputChange('urgency', option.value)}
                        className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.urgency === option.value
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <Label className="mb-2 block">What do you need help with?</Label>
                  <Textarea
                    placeholder="Describe your fashion needs, style preferences, occasion, budget, etc..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="h-32 resize-none"
                  />
                </div>

                {/* Session Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Session Information</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• Duration: {type === 'chat' ? '30 minutes' : '60 minutes'}</div>
                    <div>• Response time: {designer.responseTime}</div>
                    <div>• Languages: {designer.languages.join(', ')}</div>
                    {type === 'chat' && <div>• Image sharing supported</div>}
                    {type === 'call' && <div>• HD video quality</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Designer Card */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <img 
                    src={designer.image}
                    alt={designer.name}
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white shadow-lg"
                  />
                  <h3 className="font-bold text-lg">{designer.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      ⭐ {designer.rating}
                    </span>
                    <span>•</span>
                    <span>{designer.totalConsultations} sessions</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {designer.speciality.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{type === 'chat' ? 'Chat Session' : 'Video Call'}</span>
                    <span>₹{type === 'chat' ? designer.chatPrice : designer.callPrice}</span>
                  </div>
                  
                  {formData.urgency === 'urgent' && (
                    <div className="flex justify-between text-orange-600">
                      <span>Priority Fee (50%)</span>
                      <span>₹{Math.round((type === 'chat' ? designer.chatPrice : designer.callPrice) * 0.5)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{calculatePrice()}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBookConsultation}
                  disabled={processing || !formData.date || !formData.time}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Pay ₹{calculatePrice()} & Book Now
                    </div>
                  )}
                </Button>

                <div className="text-xs text-center text-gray-500 mt-3">
                  🔒 Secure payment powered by Razorpay
                </div>
              </CardContent>
            </Card>

            {/* Guarantee */}
            <Card className="shadow-xl border-0 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">100% Satisfaction Guarantee</span>
                </div>
                <p className="text-xs text-green-600">
                  If you're not satisfied with your consultation, we'll provide a full refund within 24 hours.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
