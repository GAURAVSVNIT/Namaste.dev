'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { searchProviders } from '@/lib/consultation-firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Star, Filter, Search, MessageCircle, Phone, Video, X, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import SplitText from '@/blocks/TextAnimations/SplitText/SplitText';
import ProfileCard from '@/blocks/Components/ProfileCard/ProfileCard';
import styles from './consultation.module.css';

const SPECIALIZATIONS = [
  'formal_wear',
  'casual_wear', 
  'bridal_wear',
  'ethnic_wear',
  'children_wear',
  'accessories',
  'alterations',
  'custom_design',
  'pattern_making',
  'embroidery',
  'tailoring',
  'styling'
];

const CONSULTATION_TYPES = [
  { id: 'chat', label: 'Chat Consultation', icon: MessageCircle, description: 'Text-based consultation' },
  { id: 'call', label: 'Voice Call', icon: Phone, description: 'Audio consultation' },
  { id: 'video_call', label: 'Video Call', icon: Video, description: 'Face-to-face consultation' }
];

export default function ConsultationPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    specialization: '',
    city: '',
    minRating: 0
  });
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewProfileProvider, setViewProfileProvider] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDetailedProfileModal, setShowDetailedProfileModal] = useState(false);

  useEffect(() => {
    loadProviders();
  }, [filters]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        role: filters.role === 'all' ? undefined : filters.role,
        specialization: (filters.specialization && filters.specialization !== 'all') ? filters.specialization : undefined,
        city: filters.city || undefined,
        minRating: filters.minRating || undefined
      };

      const results = await searchProviders(searchFilters);
      setProviders(results);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.professional?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ProviderCard component has been inlined in the main return statement

  const ProviderProfile = ({ provider }) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={provider.photoURL} alt={provider.name} />
          <AvatarFallback>{provider.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{provider.name}</h3>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={provider.role === 'fashion_designer' ? 'default' : 'secondary'}>
              {provider.role === 'fashion_designer' ? 'Fashion Designer' : 'Tailor'}
            </Badge>
            {provider.rating?.average > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{provider.rating.average.toFixed(1)}</span>
                <span className="text-muted-foreground">({provider.rating.count} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="about" className="w-full" style={{
        marginTop: '16px'
      }}>
        <TabsList style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
          borderRadius: '16px',
          padding: '8px',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <TabsTrigger value="about" style={{
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flex: '1',
            whiteSpace: 'nowrap',
            minWidth: '0',
            textAlign: 'center'
          }}>ℹ️ About</TabsTrigger>
          <TabsTrigger value="portfolio" style={{
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flex: '1',
            whiteSpace: 'nowrap',
            minWidth: '0',
            textAlign: 'center'
          }}>🎨 Portfolio</TabsTrigger>
          <TabsTrigger value="pricing" style={{
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flex: '1',
            whiteSpace: 'nowrap',
            minWidth: '0',
            textAlign: 'center'
          }}>💰 Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="about" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginTop: '24px'
        }}>
          {provider.professional?.bio && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(99, 102, 241, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative element */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                }}>
                  <span style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>ℹ</span>
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>About</h4>
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4b5563',
                margin: 0,
                fontWeight: '400',
                textAlign: 'justify'
              }}>{provider.professional.bio}</p>
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.03) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(16, 185, 129, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative element */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>⚡</span>
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Specializations</h4>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {provider.professional?.specializations?.map((spec) => (
                <Badge key={spec} style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  color: '#065f46',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}>
                  {spec.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {provider.professional?.experience > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.03) 0%, rgba(239, 68, 68, 0.03) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(245, 101, 101, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative element */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(245, 101, 101, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f56565, #ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 101, 101, 0.25)'
                }}>
                  <span style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>⭐</span>
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  background: 'linear-gradient(135deg, #f56565, #ef4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Experience</h4>
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#7c2d12',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#dc2626'
                }}>{provider.professional.experience}</span>
                years of professional experience
              </p>
            </div>
          )}

          {provider.professional?.languages?.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(124, 58, 237, 0.03) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(139, 92, 246, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative element */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                }}>
                  <span style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>🌐</span>
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Languages</h4>
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#581c87',
                margin: 0,
                fontWeight: '500'
              }}>
                {provider.professional.languages.join(', ')}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" style={{
          marginTop: '24px'
        }}>
          {provider.portfolio?.images?.length > 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.03) 0%, rgba(239, 68, 68, 0.03) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(245, 101, 101, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative element */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(245, 101, 101, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f56565, #ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 101, 101, 0.25)'
                }}>
                  <span style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>🎨</span>
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  background: 'linear-gradient(135deg, #f56565, #ef4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Portfolio</h4>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                position: 'relative',
                zIndex: 2
              }}>
                {provider.portfolio.images.map((image, index) => (
                  <div key={`${provider.id}-portfolio-${index}-${image.url || index}`} style={{
                    aspectRatio: '1',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid rgba(245, 101, 101, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 101, 101, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}>
                    <img 
                      src={image.url} 
                      alt={`Portfolio ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.05) 0%, rgba(107, 114, 128, 0.05) 100%)',
              borderRadius: '16px',
              padding: '48px 24px',
              border: '2px dashed rgba(156, 163, 175, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(156, 163, 175, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <span style={{
                  fontSize: '24px'
                }}>📁</span>
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0,
                fontWeight: '500'
              }}>
                No portfolio items uploaded yet
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" style={{
          marginTop: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.03) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(16, 185, 129, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative element */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>💰</span>
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Consultation Pricing</h4>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              zIndex: 2
            }}>
              {CONSULTATION_TYPES.map((type) => {
                const rate = provider.pricing?.[`${type.id}Rate`] || 0;
                const Icon = type.icon;
                
                return (
                  <div key={type.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <Icon style={{
                          width: '20px',
                          height: '20px',
                          color: '#059669'
                        }} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 4px 0'
                        }}>{type.label}</p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0,
                          fontWeight: '400'
                        }}>{type.description}</p>
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <p style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#059669',
                        margin: '0 0 2px 0'
                      }}>
                        ₹{(rate * 83).toFixed(0)}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        per {provider.pricing?.pricingType === 'per_minute' ? 'minute' : 'session'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (!user) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 20px 60px',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
      }}>
        <Card style={{
          maxWidth: '480px',
          margin: '60px auto 0',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          <CardHeader style={{
            padding: '32px 32px 24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <CardTitle style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '12px',
              letterSpacing: '-0.025em'
            }}>Login Required</CardTitle>
            <CardDescription style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: '1.6',
              margin: 0
            }}>
              Please log in to access our consultation services and connect with fashion experts.
            </CardDescription>
          </CardHeader>
          <CardContent style={{
            padding: '32px'
          }}>
            <Link href="/auth/login">
              <Button style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                textDecoration: 'none',
                display: 'inline-block',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ProviderCard = ({ provider }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div style={{
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Profile Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Avatar style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #f3f4f6',
              flexShrink: 0
            }}>
              <AvatarImage src={provider.photoURL} alt={provider.name} style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} />
              <AvatarFallback style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {provider.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  {provider.name}
                </h3>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: provider.role === 'fashion_designer' ? '#dbeafe' : '#e0e7ff',
                  color: provider.role === 'fashion_designer' ? '#1e40af' : '#3730a3'
                }}>
                  {provider.role === 'fashion_designer' ? 'Designer' : 'Tailor'}
                </span>
              </div>
              
              {/* Location */}
              {provider.professional?.city && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  <MapPin style={{
                    width: '14px',
                    height: '14px'
                  }} />
                  <span style={{
                    fontSize: '14px'
                  }}>{provider.professional.city}</span>
                </div>
              )}
              
              {/* Rating */}
              {provider.rating?.average > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Star style={{
                    width: '16px',
                    height: '16px',
                    fill: '#fbbf24',
                    color: '#fbbf24'
                  }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
                  }}>{provider.rating.average.toFixed(1)}</span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>({provider.rating.count})</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Specializations */}
          {provider.professional?.specializations?.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '8px'
              }}>Specializes in:</h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {provider.professional.specializations.slice(0, 3).map((spec) => (
                  <span 
                    key={spec}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {spec.replace(/_/g, ' ')}
                  </span>
                ))}
                {provider.professional.specializations.length > 3 && (
                  <span style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    border: '1px dashed #d1d5db'
                  }}>
                    +{provider.professional.specializations.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Price and Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid #f3f4f6'
          }}>
            <div>
              <span style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827'
              }}>
                ₹{((provider.pricing?.chatRate || 0) * 83).toFixed(0)}
              </span>
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                marginLeft: '4px'
              }}>
                / {provider.pricing?.pricingType === 'per_minute' ? 'min' : 'session'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewProfileProvider(provider);
                  setShowProfileModal(true);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                View Profile
              </button>
              
              <button
                onClick={() => {
                  setSelectedProvider(provider);
                  setShowBookingModal(true);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      marginTop: '100px',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        padding: '0 20px',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          margin: '0',
          padding: '80px 40px',
          textAlign: 'center',
          color: 'white',
          borderRadius: '24px 24px 24px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.4
          }} />
          
          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <SplitText 
              text="Find Your Perfect Fashion Expert"
              as="h1"
              style={{
                fontSize: '3rem',
                fontWeight: '700',
                marginBottom: '20px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                lineHeight: '1.1'
              }}
              splitBy="chars"
              stagger={0.05}
              duration={0.8}
              animationProps={{
                y: 50,
                opacity: 0
              }}
            />
            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.6',
              opacity: 0.9,
              marginBottom: '32px'
            }}>Connect with experienced fashion designers and tailors for personalized consultation services. Book 1:1 sessions, get style advice, and bring your fashion ideas to life.</p>
            
            {/* Feature highlights */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              flexWrap: 'wrap',
              marginTop: '40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ✓
                </div>
                Expert Professionals
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ✓
                </div>
                1:1 Consultations
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ✓
                </div>
                Instant Booking
              </div>
            </div>
          </div>
        </div>
        
        {/* Search & Filters Section */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px',
          border: '1px solid #e5e7eb'
        }}>
        {/* Search Bar */}
        <div style={{
          marginBottom: '32px'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Search style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#6b7280',
              zIndex: 2
            }} />
            <input
              type="text"
              placeholder="Search designers, tailors, or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 20px 18px 55px',
                border: '2px solid #e5e7eb',
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: '400',
                backgroundColor: '#f9fafb',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 20px rgba(0,0,0,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            />
          </div>
        </div>
        
        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>Role</label>
            <Select 
              value={filters.role} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
                padding: '8px',
                zIndex: 50,
                minWidth: 'var(--radix-select-trigger-width)',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <SelectItem value="all" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  margin: '2px 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}>
                  <span style={{ width: '100%', display: 'block' }}>All Roles</span>
                  <style jsx>{`
                    [data-state="checked"] [data-radix-select-item-indicator] {
                      display: none !important;
                    }
                  `}</style>
                </SelectItem>
                <SelectItem value="fashion_designer" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  margin: '2px 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}>
                  <span style={{ width: '100%', display: 'block' }}>Fashion Designer</span>
                </SelectItem>
                <SelectItem value="tailor" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  margin: '2px 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}>
                  <span style={{ width: '100%', display: 'block' }}>Tailor</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>Specialty</label>
            <Select 
              value={filters.specialization} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}
            >
              <SelectTrigger style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
                padding: '8px',
                zIndex: 50,
                minWidth: 'var(--radix-select-trigger-width)',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <SelectItem value="all" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  margin: '2px 0'
                }}>All Specialties</SelectItem>
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec} style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    margin: '2px 0'
                  }}>
                    {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>Location</label>
            <div style={{
              position: 'relative'
            }}>
              <MapPin style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#6b7280',
                zIndex: 2
              }} />
              <input
                id="city-filter"
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 45px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

        {/* Providers Grid */}
        <div style={{
          padding: '0 20px',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[...Array(6)].map((_, i) => (
                <div key={`loading-skeleton-${i}`} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    height: '100px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    animation: 'pulse 2s infinite'
                  }} />
                  <div style={{
                    height: '20px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    animation: 'pulse 2s infinite'
                  }} />
                  <div style={{
                    height: '16px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    width: '75%',
                    animation: 'pulse 2s infinite'
                  }} />
                </div>
              ))}
            </div>
          ) : filteredProviders.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '60px 40px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '40px'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '1.125rem',
                marginBottom: '24px'
              }}>No providers found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ role: 'all', specialization: '', city: '', minRating: 0 });
                  setSearchQuery('');
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={(open) => {
        if (!open) {
          setShowBookingModal(false);
          setSelectedProvider(null);
        }
      }}>
        {selectedProvider && (
          <DialogContent style={{
            maxWidth: '500px',
            width: '90vw',
            padding: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
            border: 'none',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            overflow: 'hidden',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Header with enhanced gradient background */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative pattern overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.3
              }} />
              
              <DialogHeader style={{ position: 'relative', zIndex: 2 }}>
                <DialogTitle style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <Calendar style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  Book Consultation
                </DialogTitle>
                <DialogDescription style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '500'
                }}>
                  Book a consultation with <span style={{ fontWeight: '700', color: 'white' }}>{selectedProvider.name}</span>
                </DialogDescription>
              </DialogHeader>
            </div>
            
            {/* Content */}
            <div style={{ padding: '32px' }}>
              {/* Provider Info Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Card background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                  transform: 'translate(30px, -30px)'
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                    border: '3px solid rgba(255, 255, 255, 0.9)'
                  }}>
                    {selectedProvider.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>{selectedProvider.name}</h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {selectedProvider.role === 'fashion_designer' ? 'Fashion Designer' : 'Master Tailor'}
                    </p>
                  </div>
                </div>
                
                {selectedProvider.pricing && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(99, 102, 241, 0.1)',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#1f2937',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ₹{((selectedProvider.pricing.chatRate || 0) * 83).toFixed(0)}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      / {selectedProvider.pricing.pricingType === 'per_minute' ? 'minute' : 'session'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Enhanced Description */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                marginBottom: '32px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}>
                    <Info style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                  <p style={{
                    fontSize: '15px',
                    color: '#1e40af',
                    lineHeight: '1.6',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    This will redirect you to the booking page where you can select your preferred time and consultation type.
                  </p>
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '8px'
              }}>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedProvider(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Cancel
                </Button>
                <Link href={`/consultation/${selectedProvider.id}/book`}>
                  <Button style={{
                    padding: '12px 32px',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  >
                    Continue to Book
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Profile Modal - Just the ProfileCard */}
      {showProfileModal && viewProfileProvider && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowProfileModal(false);
            setViewProfileProvider(null);
          }
        }}>
          <div 
            style={{
              position: 'relative',
              opacity: 1,
              transform: 'scale(1) translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileCard
              avatarUrl={viewProfileProvider.photoURL || '/default-avatar.png'}
              name={viewProfileProvider.name}
              title={viewProfileProvider.role === 'fashion_designer' ? 'Fashion Designer' : 'Master Tailor'}
              handle={viewProfileProvider.name?.toLowerCase().replace(/\s+/g, '')}
              status="Available"
              contactText="Details"
              onContactClick={() => {
                // Close ProfileCard modal and open detailed profile modal
                setShowProfileModal(false);
                // We need to set up a detailed profile modal state
                setViewProfileProvider(viewProfileProvider);
                setShowDetailedProfileModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Detailed Profile Modal */}
      <Dialog open={showDetailedProfileModal} onOpenChange={(open) => {
        if (!open) {
          setShowDetailedProfileModal(false);
          setViewProfileProvider(null);
        }
      }}>
        {viewProfileProvider && (
          <DialogContent
            style={{
              maxWidth: '800px',
              width: '90vw',
              maxHeight: '85vh',
              padding: 0,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
              border: 'none',
              borderRadius: '24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <DialogTitle style={{ position: 'absolute', left: '-9999px', fontSize: '1px' }}>
              Detailed Profile of {viewProfileProvider.name}
            </DialogTitle>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative pattern overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.3
              }} />
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  marginBottom: '16px'
                }}>
                  <Avatar style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    flexShrink: 0
                  }}>
                    <AvatarImage src={viewProfileProvider.photoURL} alt={viewProfileProvider.name} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} />
                    <AvatarFallback style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontSize: '36px',
                      fontWeight: '600'
                    }}>
                      {viewProfileProvider.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div style={{ flex: 1, color: 'white' }}>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: 'white',
                      margin: '0 0 8px 0',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {viewProfileProvider.name}
                    </h2>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        {viewProfileProvider.role === 'fashion_designer' ? 'Fashion Designer' : 'Tailor'}
                      </span>
                      {viewProfileProvider.rating?.average > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Star style={{
                            width: '18px',
                            height: '18px',
                            fill: '#fbbf24',
                            color: '#fbbf24'
                          }} />
                          <span style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white'
                          }}>{viewProfileProvider.rating.average.toFixed(1)}</span>
                          <span style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.8)'
                          }}>({viewProfileProvider.rating.count} reviews)</span>
                        </div>
                      )}
                    </div>
                    {viewProfileProvider.professional?.city && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}>
                        <MapPin style={{
                          width: '16px',
                          height: '16px'
                        }} />
                        <span style={{
                          fontSize: '16px'
                        }}>{viewProfileProvider.professional.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div style={{ 
              padding: '32px',
              maxHeight: 'calc(85vh - 200px)',
              overflowY: 'auto'
            }}>
              <ProviderProfile provider={viewProfileProvider} />
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(229, 231, 235, 0.3)'
              }}>
                <button
                  onClick={() => {
                    setShowDetailedProfileModal(false);
                    setSelectedProvider(viewProfileProvider);
                    setShowBookingModal(true);
                  }}
                  style={{
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <Calendar style={{ width: '18px', height: '18px' }} />
                  Book Consultation
                </button>
                <button
                  onClick={() => {
                    setShowDetailedProfileModal(false);
                    setViewProfileProvider(null);
                  }}
                  style={{
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

