'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { searchProviders } from '@/lib/consultation-firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Star, Filter, Search, MessageCircle, Phone, Video, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
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
                <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
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
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to access consultation services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ProviderCard = ({ provider }) => (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-200 bg-white w-full max-w-2xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Profile Image */}
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                <AvatarImage src={provider.photoURL} alt={provider.name} className="object-cover" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                  {provider.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {provider.rating?.average > 0 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold text-gray-800">{provider.rating.average.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-0.5">({provider.rating.count})</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Name and Role */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-2xl font-bold text-gray-800 truncate">
                {provider.name}
              </h3>
              <Badge 
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  provider.role === 'fashion_designer' 
                    ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                }`}
              >
                {provider.role === 'fashion_designer' ? 'Fashion Designer' : 'Master Tailor'}
              </Badge>
            </div>
            
            {/* Location */}
            {provider.professional?.city && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                <span className="text-base">{provider.professional.city}</span>
              </div>
            )}
            
            {/* Specializations */}
            {provider.professional?.specializations?.length > 0 && (
              <div className="py-1">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Specializes in:</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.professional.specializations.slice(0, 4).map((spec) => (
                    <span 
                      key={spec} 
                      className="px-3 py-1 text-sm rounded-full bg-gray-50 border border-gray-200 text-gray-700"
                    >
                      {spec.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {provider.professional.specializations.length > 4 && (
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-50 border border-dashed border-gray-300 text-gray-500">
                      +{provider.professional.specializations.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Price and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 mt-2 border-t border-gray-100 gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{((provider.pricing?.chatRate || 0) * 83).toFixed(0)}
                </span>
                <span className="text-sm text-gray-500">
                  / {provider.pricing?.pricingType === 'per_minute' ? 'minute' : 'session'}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="h-10 px-5 text-sm font-medium bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('=== VIEW PROFILE BUTTON CLICKED ===');
                    console.log('Event:', e);
                    console.log('Provider:', provider.name, provider.id);
                    console.log('Current showProfileModal state:', showProfileModal);
                    console.log('Current viewProfileProvider:', viewProfileProvider);
                    
                    setViewProfileProvider(provider);
                    setShowProfileModal(true);
                    
                    console.log('States updated - should show modal now');
                    console.log('=== END VIEW PROFILE CLICK ===');
                  }}
                  style={{ zIndex: 10, position: 'relative' }}
                >
                  View Profile
                </Button>
                
                <Button 
                  className="h-10 px-5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all"
                  onClick={() => {
                    setSelectedProvider(provider);
                    setShowBookingModal(true);
                  }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Find Your Perfect Fashion Expert</h1>
        <p>Connect with experienced fashion designers and tailors for personalized consultation services. Book 1:1 sessions, get style advice, and bring your fashion ideas to life.</p>
        
        {/* Debug Test Button */}
        <div className="mt-4">
          <Button 
            onClick={() => {
              console.log('Test button clicked!');
              setViewProfileProvider({ name: 'Test Provider', role: 'fashion_designer', professional: { bio: 'Test bio' } });
              setShowProfileModal(true);
              console.log('Test modal should now be open');
            }}
            variant="outline"
          >
            TEST: Open Profile Modal
          </Button>
        </div>
      </header>
      
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search designers, tailors, or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="role-filter" className={styles.filterLabel}>Role</label>
              <Select 
                value={filters.role} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="fashion_designer">Fashion Designer</SelectItem>
                  <SelectItem value="tailor">Tailor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="specialization-filter" className={styles.filterLabel}>Specialty</label>
              <Select 
                value={filters.specialization} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="city-filter" className={styles.filterLabel}>Location</label>
              <div className={styles.locationInput}>
                <MapPin className={styles.locationIcon} />
                <input
                  id="city-filter"
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className={styles.cityInput}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No providers found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFilters({ role: 'all', specialization: '', city: '', minRating: 0 });
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <BookingModal
          provider={selectedProvider}
          user={user}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedProvider(null);
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && viewProfileProvider && (
        <Dialog open={showProfileModal} onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', open);
          setShowProfileModal(open);
          if (!open) {
            setViewProfileProvider(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white" aria-describedby="profile-dialog-description">
            <DialogHeader>
              <DialogTitle>{viewProfileProvider.name} - Profile</DialogTitle>
              <DialogDescription id="profile-dialog-description">
                View detailed information about {viewProfileProvider.name}, including their portfolio, pricing, and experience.
              </DialogDescription>
            </DialogHeader>
            <ProviderProfile provider={viewProfileProvider} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const BookingModal = ({ provider, user, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Consultation</DialogTitle>
          <DialogDescription>
            Book a consultation with {provider.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will redirect you to the booking page where you can select your preferred time and consultation type.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Link href={`/consultation/${provider.id}/book`}>
              <Button>Continue</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
