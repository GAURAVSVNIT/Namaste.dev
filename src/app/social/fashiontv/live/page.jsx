'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApprovedLivestreams, addLivestream, parseStreamUrl, getAllLivestreams, deleteLivestream } from '@/lib/fashiontv';
import { Home, Plus, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LiveFeedGrid from '@/components/fashiontv/LiveFeedGrid';

const TOAST_MESSAGES = {
  AUTH_REQUIRED: {
    title: "Authentication Required",
    description: "Please sign in to add a live stream",
    variant: "destructive"
  },
  MISSING_INFO: {
    title: "Missing Information", 
    description: "Please fill in all required fields",
    variant: "destructive"
  }
};

// Utility functions
const validateStreamForm = (formData, user) => {
  if (!user) {
    return { isValid: false, message: TOAST_MESSAGES.AUTH_REQUIRED };
  }
  
  if (!formData.title?.trim() || !formData.url?.trim()) {
    return { isValid: false, message: TOAST_MESSAGES.MISSING_INFO };
  }
  
  return { isValid: true };
};

export default function LivePage() {
  const { user } = useAuth();
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    platform: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStreams();
  }, []);

  // Fetch streams from API
  const fetchStreams = useCallback(async () => {
    try {
      setIsLoading(true);
      const streamsData = await getApprovedLivestreams(20);
      setStreams(streamsData);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: "Error",
        description: "Failed to load live streams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const validation = validateStreamForm(formData, user);
    if (!validation.isValid) {
      toast(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse and validate URL
      const parsedUrl = parseStreamUrl(formData.url);
      
      const streamData = {
        title: formData.title,
        url: formData.url,
        platform: parsedUrl.platform,
        embedUrl: parsedUrl.embedUrl,
        description: formData.description || ''
      };

      await addLivestream(user.uid, streamData);
      
      toast({
        title: "Stream Added Successfully",
        description: "Your live stream is now visible to everyone",
      });
      
      setFormData({ title: '', url: '', platform: '', description: '' });
      setShowSubmitForm(false);
      
      // Refresh the streams list to show the new stream
      fetchStreams();
      
    } catch (error) {
      console.error('Error submitting stream:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add live stream",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user]);

  // Handle URL change and platform detection
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));
    
    // Try to detect platform from URL
    try {
      if (url.trim()) {
        const parsed = parseStreamUrl(url);
        setFormData(prev => ({ ...prev, platform: parsed.platform }));
      }
    } catch (error) {
      // Invalid URL, but don't show error yet
      setFormData(prev => ({ ...prev, platform: '' }));
    }
  }, []);

  const handleStreamDeleted = (streamId) => {
    // Remove the deleted stream from the local state
    setStreams(prevStreams => prevStreams.filter(stream => stream.id !== streamId));
  };
  
  const handleDeleteAllSampleStreams = async () => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to clear all existing live streams? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      // Get all streams
      const allStreams = await getAllLivestreams();
      
      // Filter system/demo streams (those with userId starting with 'sample-user')
      const streamsToDelete = allStreams.filter(stream => stream.userId?.startsWith('sample-user'));
      
      // Delete each stream
      const deletePromises = streamsToDelete.map(stream => deleteLivestream(stream.id));
      await Promise.all(deletePromises);
      
      toast({
        title: "Streams Cleared",
        description: `${streamsToDelete.length} live streams have been removed`,
      });
      
      // Refresh the streams list
      fetchStreams();
    } catch (error) {
      console.error('Error clearing streams:', error);
      toast({
        title: "Error",
        description: "Failed to clear streams. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #7c3aed 0%, #000 50%, #ec4899 100%)' }}>
      {/* Professional Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <Link href="/social/fashiontv">
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span>← Back to TV</span>
            </button>
          </Link>

          <Link href="/social">
            <button style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '12px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <Home style={{ width: '24px', height: '24px' }} />
            </button>
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '800', 
            color: 'white', 
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Live Fashion Streams
          </h1>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '20px', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Discover and share live fashion content from around the world
          </p>
        </div>
      </div>

      {/* Professional Action Buttons */}
      {user ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px', gap: '20px', padding: '0 32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ec4899)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Plus style={{ width: '20px', height: '20px' }} />
            <span>Add Stream URL</span>
          </button>
          
          {/* Admin: Clear All Streams Button */}
          {streams.some(stream => stream.userId?.startsWith('sample-user')) && (
            <button
              onClick={handleDeleteAllSampleStreams}
              style={{
                background: 'linear-gradient(135deg, #ea580c, #f97316)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(234, 88, 12, 0.3)'
              }}
            >
              <span>Clear Demo Streams</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px', padding: '0 32px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            color: 'white',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '16px', margin: '0 0 16px 0' }}>Want to share your live fashion content?</p>
            <Link href="/auth/login">
              <button style={{
                background: 'linear-gradient(135deg, #dc2626, #ec4899)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Sign In to Add Streams
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Professional Submit Form Modal */}
      {showSubmitForm && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSubmitForm(false);
            }
          }}
        >
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px',
            backdropFilter: 'blur(20px)'
          }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #dc2626, #ec4899)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <Plus style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', margin: '0 0 12px 0' }}>Add Live Stream</h2>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Share your live fashion content with the community</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Stream Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                placeholder="e.g., Milan Fashion Week 2025 - Live Runway Show"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Stream Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  resize: 'none',
                  minHeight: '100px'
                }}
                placeholder="Brief description of your live stream content..."
                rows="3"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Stream URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={handleUrlChange}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                placeholder="https://youtube.com/watch?v=... or https://twitch.tv/channel"
                required
              />
              {formData.platform && (
                <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#065f46', margin: 0 }}>
                    ✓ Platform detected: <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{formData.platform}</span>
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: isSubmitting ? 'rgba(156, 163, 175, 0.8)' : 'linear-gradient(135deg, #dc2626, #ec4899)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Adding Stream...</span>
                  </>
                ) : (
                  <>
                    <Plus style={{ width: '16px', height: '16px' }} />
                    <span>Add Stream</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                style={{
                  flex: 1,
                  background: 'rgba(243, 244, 246, 0.8)',
                  color: '#374151',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(209, 213, 219, 0.8)',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* External Streams Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 48px 32px' }}>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Loading live streams...</p>
            </div>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-20">
            <ExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Live Streams Available</h3>
            <p className="text-gray-300 mb-4">Be the first to share a live fashion stream with the community!</p>
            {user && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Add Live Stream
              </button>
            )}
          </div>
        ) : (
          <LiveFeedGrid 
            streams={streams} 
            currentUser={user} 
            onStreamDeleted={handleStreamDeleted} 
          />
        )}
      </div>
    </div>
  );
}
