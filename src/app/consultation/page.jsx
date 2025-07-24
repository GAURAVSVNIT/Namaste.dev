'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Video, 
  Star, 
  Clock, 
  Shield, 
  Award,
  Users,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAvailableDesigners } from '@/lib/consultation-firebase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const ConsultationPage = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        // For demo, we'll create some sample designers if none exist
        const availableDesigners = await getAvailableDesigners();
        
        if (availableDesigners.length === 0) {
          // Demo data for competition
          const sampleDesigners = [
            {
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
            {
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
            {
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
          ];
          setDesigners(sampleDesigners);
        } else {
          setDesigners(availableDesigners);
        }
      } catch (error) {
        console.error('Error fetching designers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigners();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full mb-6">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Fashion Consultation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Expert Fashion <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Consultants</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized fashion advice from top designers and stylists. Book a chat or video call consultation.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: MessageCircle, title: 'Chat Consultation', desc: 'Text-based advice with image sharing' },
            { icon: Video, title: 'Video Calls', desc: 'Face-to-face styling sessions' },
            { icon: Shield, title: 'Secure Payment', desc: 'Powered by Razorpay with full refund protection' }
          ].map((feature, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <feature.icon className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Designers Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {designers.map((designer) => (
            <motion.div
              key={designer.id}
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Designer Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <img 
                    src={designer.image} 
                    alt={designer.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-1">{designer.name}</h3>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{designer.rating}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{designer.totalConsultations} sessions</span>
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

                {/* Badges */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {designer.badges?.map((badge, idx) => (
                    <Badge key={idx} className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{designer.bio}</p>

                {/* Response Time */}
                <div className="flex items-center justify-center gap-1 text-green-600 text-sm mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Responds {designer.responseTime}</span>
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Link 
                    href={`/consultation/${designer.id}/book?type=chat`}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-xs">Chat</div>
                        <div className="font-semibold">₹{designer.chatPrice}</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link 
                    href={`/consultation/${designer.id}/book?type=call`}
                    className="flex-1"
                  >
                    <Button 
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Video className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-xs opacity-90">Video Call</div>
                        <div className="font-semibold">₹{designer.callPrice}</div>
                      </div>
                    </Button>
                  </Link>
                </div>

                {/* Languages */}
                <div className="text-center text-xs text-gray-500">
                  Languages: {designer.languages.join(', ')}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white"
        >
          <Award className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Why Choose Our Consultants?</h2>
          <p className="mb-6 opacity-90">All our fashion experts are verified professionals with proven track records</p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>✓ Instant refund if not satisfied</div>
            <div>✓ 24/7 customer support</div>
            <div>✓ Secure payment processing</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsultationPage;
