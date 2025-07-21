'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllLooks, deleteLook } from '@/lib/look';
import LookCard from '@/components/look/LookCard';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [looks, setLooks] = useState([]);
  const [filteredLooks, setFilteredLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        setIsLoading(true);
        const looksData = await getAllLooks();
        setLooks(looksData);
        setFilteredLooks(looksData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load looks. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLooks();
  }, []);

  useEffect(() => {
    if (!looks.length) return;
    
    let filtered = [...looks];
    
    // Search filter
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(look => 
        look.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (look.tags && look.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Mood filter
    if (moodFilter && moodFilter.trim()) {
      filtered = filtered.filter(look => look.mood === moodFilter);
    }
    
    // Sort
    const currentSortBy = sortBy || 'recent';
    switch (currentSortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        break;
      case 'trending':
        // For trending, we can use a combination of recent + likes
        filtered.sort((a, b) => {
          const aScore = (a.likes?.length || 0) + (new Date(a.createdAt) > new Date(Date.now() - 7*24*60*60*1000) ? 10 : 0);
          const bScore = (b.likes?.length || 0) + (new Date(b.createdAt) > new Date(Date.now() - 7*24*60*60*1000) ? 10 : 0);
          return bScore - aScore;
        });
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    setFilteredLooks(filtered);
  }, [looks, searchTerm || '', moodFilter || '', sortBy || 'recent']);

  const handleEditLook = (look) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to edit looks.",
        variant: "destructive",
      });
      return;
    }
    router.push(`/social/look/edit/${look.id}`);
  };

  const handleDeleteLook = async (lookId) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to delete looks.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this look?')) {
      return;
    }

    try {
      await deleteLook(lookId, user.uid);
      setLooks(prev => prev.filter(look => look.id !== lookId));
      toast({
        title: "Success",
        description: "Look deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete look. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      paddingTop: '80px' // Add space for navbar
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        margin: '0 20px',
        marginBottom: '40px',
        borderRadius: '24px',
        padding: '50px 0 40px 0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          right: '-200px',
          width: '500px',
          height: '500px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}>
            Fashion Looks
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '30px',
            fontWeight: '400',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            maxWidth: '500px',
            margin: '0 auto 30px',
            lineHeight: '1.5'
          }}>
            Discover, create, and share amazing fashion inspirations with the community
          </p>

          {/* Action Button */}
          {user && (
            <Link href="/social/look/upload" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#667eea',
                border: 'none',
                borderRadius: '16px',
                padding: '18px 40px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.25)';
                e.target.style.background = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              }}>
                ✨ Upload New Look
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Search Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '50px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px'
          }}>
            <input
              type="text"
              placeholder="✨ Search amazing fashion looks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '22px 60px 22px 24px',
                borderRadius: '25px',
                border: '2px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#2d3748',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.25), 0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'scale(1.03) translateY(-2px)';
                e.target.style.background = 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #764ba2 0%, #667eea 100%) border-box';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.15)';
                e.target.style.transform = 'scale(1) translateY(0)';
                e.target.style.background = 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box';
              }}
            />
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              pointerEvents: 'none'
            }}>
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              🎨 Filter by Style
            </h3>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {['All', 'Casual', 'Formal', 'Sporty', 'Elegant', 'Trendy', 'Vintage', 'Bohemian', 'Classic', 'Edgy', 'Romantic', 'Minimalist', 'Chill'].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodFilter(mood === 'All' ? '' : mood)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: moodFilter === mood || (mood === 'All' && !moodFilter) 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.8)',
                    color: moodFilter === mood || (mood === 'All' && !moodFilter) ? 'white' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: moodFilter === mood || (mood === 'All' && !moodFilter)
                      ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                      : '0 2px 6px rgba(0, 0, 0, 0.05)',
                    textShadow: moodFilter === mood || (mood === 'All' && !moodFilter) 
                      ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!(moodFilter === mood || (mood === 'All' && !moodFilter))) {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(moodFilter === mood || (mood === 'All' && !moodFilter))) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'recent', label: '🕐 Most Recent', icon: '🕐' },
            { key: 'popular', label: '❤️ Most Liked', icon: '❤️' },
            { key: 'trending', label: '🔥 Trending', icon: '🔥' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '15px',
                border: 'none',
                background: sortBy === option.key 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#ffffff',
                color: sortBy === option.key ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: sortBy === option.key 
                  ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: sortBy === option.key ? 'none' : '1px solid #e5e7eb'
              }}
              onMouseEnter={(e) => {
                if (sortBy !== option.key) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== option.key) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <p style={{
            color: '#718096',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {isLoading ? 'Loading amazing looks...' : 
             `${filteredLooks.length} look${filteredLooks.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Looks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '60px',
          justifyItems: 'center'
        }}>
          {isLoading ? (
            // Loading Cards
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  height: '400px',
                  width: '100%',
                  maxWidth: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{
                  color: '#cbd5e0',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  ✨ Loading...
                </div>
              </div>
            ))
          ) : filteredLooks.length === 0 ? (
            // Empty State
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 40px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              margin: '0 auto',
              maxWidth: '600px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '24px'
              }}>
                👗
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '16px'
              }}>
                No looks found
              </h3>
              <p style={{
                color: '#718096',
                fontSize: '16px',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                {searchTerm 
                  ? `No results for "${searchTerm}". Try different search terms.`
                  : 'Be the first to share your amazing fashion look!'
                }
              </p>
              {user && (
                <Link href="/social/look/upload" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }}>
                    Upload Your First Look
                  </button>
                </Link>
              )}
            </div>
          ) : (
            // Look Cards
            filteredLooks.map((look) => (
              <div
                key={look.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #f1f5f9',
                  position: 'relative',
                  width: '100%',
                  maxWidth: '350px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <LookCard
                  look={look}
                  onEdit={handleEditLook}
                  onDelete={handleDeleteLook}
                  style={{
                    border: 'none',
                    boxShadow: 'none',
                    borderRadius: '0',
                    background: 'transparent'
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
