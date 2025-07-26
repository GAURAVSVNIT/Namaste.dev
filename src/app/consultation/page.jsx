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

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          {provider.professional?.bio && (
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-sm text-muted-foreground">{provider.professional.bio}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {provider.professional?.specializations?.map((spec) => (
                <Badge key={spec} variant="outline">
                  {spec.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {provider.professional?.experience > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Experience</h4>
              <p className="text-sm text-muted-foreground">
                {provider.professional.experience} years of experience
              </p>
            </div>
          )}

          {provider.professional?.languages?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Languages</h4>
              <p className="text-sm text-muted-foreground">
                {provider.professional.languages.join(', ')}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {provider.portfolio?.images?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {provider.portfolio.images.map((image, index) => (
                <div key={`${provider.id}-portfolio-${index}-${image.url || index}`} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No portfolio items uploaded yet
            </p>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid gap-4">
            {CONSULTATION_TYPES.map((type) => {
              const rate = provider.pricing?.[`${type.id}Rate`] || 0;
              const Icon = type.icon;
              
              return (
                <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(rate * 83).toFixed(0)}/{provider.pricing?.pricingType === 'per_minute' ? 'min' : 'session'}
                    </p>
                  </div>
                </div>
              );
            })}
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
          <DialogContent className="max-w-md rounded-xl shadow-2xl border-0 p-0 bg-white">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Book Consultation
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Book a consultation with <span className="font-medium text-gray-900">{selectedProvider.name}</span>
                </DialogDescription>
              </DialogHeader>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Provider Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {selectedProvider.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedProvider.name}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedProvider.role === 'fashion_designer' ? 'Fashion Designer' : 'Master Tailor'}
                    </p>
                  </div>
                </div>
                {selectedProvider.pricing && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{((selectedProvider.pricing.chatRate || 0) * 83).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {selectedProvider.pricing.pricingType === 'per_minute' ? 'minute' : 'session'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This will redirect you to the booking page where you can select your preferred time and consultation type.
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedProvider(null);
                  }}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Cancel
                </Button>
                <Link href={`/consultation/${selectedProvider.id}/book`}>
                  <Button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                    Continue to Book
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={(open) => {
        console.log('Dialog onOpenChange:', open);
        setShowProfileModal(open);
        if (!open) {
          setViewProfileProvider(null);
        }
      }}>
        {viewProfileProvider && (
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl border-0 p-0">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {viewProfileProvider.name.charAt(0).toUpperCase()}
                  </div>
                  {viewProfileProvider.name} - Profile
                </DialogTitle>
                <DialogDescription id="profile-dialog-description" className="text-gray-600">
                  View detailed information about {viewProfileProvider.name}, including their portfolio, pricing, and experience.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6">
              <ProviderProfile provider={viewProfileProvider} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

