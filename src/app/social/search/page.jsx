"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import SocialBottomNav from "@/components/SocialBottomNav";
import { searchUsers, toggleFollow } from "@/lib/social";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const SearchPage = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("people");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set()); // Track which users we're following
  const [followLoading, setFollowLoading] = useState(new Set()); // Track follow button loading states

  // Handle follow/unfollow action
  const handleFollowToggle = async (userId, userName) => {
    // Comprehensive validation
    if (!currentUser) {
      console.error('No current user available');
      return;
    }
    
    if (!currentUser.uid) {
      console.error('Current user ID is not available');
      return;
    }
    
    if (!userId) {
      console.error('Target user ID is not available');
      return;
    }
    
    if (followLoading.has(userId)) {
      return; // Already processing this user
    }
    
    // Don't allow following yourself
    if (currentUser.uid === userId) {
      console.log('Cannot follow yourself');
      return;
    }
    
    setFollowLoading(prev => new Set([...prev, userId]));
    
    try {
      const isCurrentlyFollowing = followingUsers.has(userId);
      await toggleFollow(currentUser.uid, userId);
      
      // Update following state
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const categories = [
    { id: "people", label: "People" },
  ];

  // Search function
  const performSearch = async (query, category) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      let results = [];
      
      // Only search for people since that's the only category now
      const users = await searchUsers(query);
      const userResults = users.map(user => ({
        id: `user-${user.id}`,
        userId: user.id, // Keep the original user ID for follow functionality
        type: "person",
        name: user.name || user.email?.split('@')[0] || 'User',
        avatar: user.avatar, // Use the avatar field that's already properly mapped in searchUsers
        bio: user.bio,
        location: user.location,
        followers: user.followersCount || 0,
        looks: user.looks || [],
        reels: user.reels || [],
        looksCount: user.looksCount || 0,
        reelsCount: user.reelsCount || 0
      }));
      results = [...results, ...userResults];
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to trigger search when query or category changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, selectedCategory);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const filteredResults = searchResults;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      paddingBottom: '80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      marginTop: '88px'
    }}>
      
      {/* Search Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '16px',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(228, 228, 231, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af',
                zIndex: 1
              }} 
            />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '48px',
                paddingRight: '20px',
                paddingTop: '14px',
                paddingBottom: '14px',
                background: 'rgba(248, 250, 252, 0.8)',
                border: '2px solid transparent',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: '400',
                color: '#1e293b',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                e.target.style.borderColor = 'transparent';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            />
          </div>
          <button 
            style={{
              padding: '12px',
              background: hoveredButton === 'filter' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: hoveredButton === 'filter' ? '#3b82f6' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={() => setHoveredButton('filter')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <Filter style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        padding: '16px',
        borderBottom: '1px solid rgba(228, 228, 231, 0.2)',
        position: 'sticky',
        top: '88px',
        zIndex: 40
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          maxWidth: '600px',
          margin: '0 auto',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: selectedCategory === category.id ? '12px 24px' : '10px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: selectedCategory === category.id ? '600' : '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
                background: selectedCategory === category.id 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : hoveredTab === category.id 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(248, 250, 252, 0.8)',
                color: selectedCategory === category.id 
                  ? '#ffffff'
                  : hoveredTab === category.id 
                    ? '#3b82f6'
                    : '#64748b',
                boxShadow: selectedCategory === category.id 
                  ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                  : '0 2px 6px rgba(0, 0, 0, 0.04)',
                transform: selectedCategory === category.id ? 'translateY(-1px)' : 'none'
              }}
              onMouseEnter={() => setHoveredTab(category.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div style={{
        padding: '20px 16px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {searchQuery ? (
          isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              border: '2px solid rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(59, 130, 246, 0.3)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0,
                fontWeight: '500'
              }}>
                Searching...
              </p>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : filteredResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredResults.map((result) => (
                <div 
                  key={result.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: hoveredCard === result.id 
                      ? '0 8px 32px rgba(0, 0, 0, 0.12)'
                      : '0 4px 16px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(228, 228, 231, 0.3)',
                    transition: 'all 0.3s ease',
                    transform: hoveredCard === result.id ? 'translateY(-2px)' : 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredCard(result.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    if (result.type === "person") {
                      const username = result.name.toLowerCase().replace(/\s+/g, '');
                      router.push(`/social/user/${username}`);
                    }
                  }}
                >
                  {result.type === "person" && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(59, 130, 246, 0.1)',
                        overflow: 'hidden',
                        background: result.avatar && (result.avatar.startsWith('http') || result.avatar.startsWith('data:') || result.avatar.startsWith('/')) 
                          ? 'transparent' 
                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                      }}>
                        {result.avatar && (result.avatar.startsWith('http') || result.avatar.startsWith('data:') || result.avatar.startsWith('/')) ? (
                          <img 
                            src={result.avatar} 
                            alt={result.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{
                          fontSize: '32px',
                          display: result.avatar && (result.avatar.startsWith('http') || result.avatar.startsWith('data:') || result.avatar.startsWith('/')) ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}>
                          {result.avatar && !result.avatar.startsWith('http') && !result.avatar.startsWith('data:') && !result.avatar.startsWith('/') ? result.avatar : '👤'}
                        </div>
                      </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontWeight: '600',
                            fontSize: '16px',
                            color: '#1e293b',
                            margin: '0 0 4px 0',
                            lineHeight: '1.4'
                          }}>
                            {result.name}
                          </h3>
                          {result.bio && (
                            <p style={{
                              color: '#64748b',
                              fontSize: '13px',
                              margin: '0 0 4px 0',
                              fontWeight: '400',
                              lineHeight: '1.3',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}>
                              {result.bio}
                            </p>
                          )}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <p style={{
                              color: '#64748b',
                              fontSize: '14px',
                              margin: 0,
                              fontWeight: '400'
                            }}>
                              {result.followers} followers
                            </p>
                            {result.location && (
                              <p style={{
                                color: '#64748b',
                                fontSize: '13px',
                                margin: 0,
                                fontWeight: '400',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                📍 {result.location}
                              </p>
                            )}
                          </div>
                          
                          {/* Content Stats */}
                          {(result.looksCount > 0 || result.reelsCount > 0) && (
                            <div style={{
                              display: 'flex',
                              gap: '16px',
                              marginTop: '8px'
                            }}>
                              {result.looksCount > 0 && (
                                <span style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  color: '#8b5cf6',
                                  background: 'rgba(139, 92, 246, 0.1)',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontWeight: '500'
                                }}>
                                  📸 {result.looksCount} looks
                                </span>
                              )}
                              {result.reelsCount > 0 && (
                                <span style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  color: '#06b6d4',
                                  background: 'rgba(6, 182, 212, 0.1)',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontWeight: '500'
                                }}>
                                  🎥 {result.reelsCount} reels
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Only show follow button if not the current user */}
                        {currentUser && currentUser.uid !== result.userId && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent navigation when clicking follow button
                              handleFollowToggle(result.userId, result.name);
                            }}
                            disabled={followLoading.has(result.userId)}
                            style={{
                              padding: '8px 20px',
                              background: followingUsers.has(result.userId)
                                ? hoveredButton === `follow-${result.userId}` 
                                  ? 'rgba(239, 68, 68, 0.9)'
                                  : 'rgba(107, 114, 128, 0.8)'
                                : hoveredButton === `follow-${result.userId}` 
                                  ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: followLoading.has(result.userId) ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: followingUsers.has(result.userId)
                                ? '0 2px 8px rgba(107, 114, 128, 0.3)'
                                : '0 2px 8px rgba(59, 130, 246, 0.3)',
                              transform: hoveredButton === `follow-${result.userId}` ? 'scale(1.05)' : 'scale(1)',
                              opacity: followLoading.has(result.userId) ? 0.7 : 1
                            }}
                            onMouseEnter={() => setHoveredButton(`follow-${result.userId}`)}
                            onMouseLeave={() => setHoveredButton(null)}
                          >
                            {followLoading.has(result.userId) 
                              ? '...' 
                              : followingUsers.has(result.userId) 
                                ? 'Unfollow' 
                                : 'Follow'
                            }
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {result.type === "look" && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        fontSize: '36px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        borderRadius: '12px',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(251, 191, 36, 0.2)'
                      }}>
                        {result.image}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontWeight: '600',
                          fontSize: '16px',
                          color: '#1e293b',
                          margin: '0 0 4px 0',
                          lineHeight: '1.4'
                        }}>
                          {result.title}
                        </h3>
                        <p style={{
                          color: '#64748b',
                          fontSize: '14px',
                          margin: 0,
                          fontWeight: '400'
                        }}>
                          {result.likes} likes
                        </p>
                      </div>
                      <button 
                        style={{
                          padding: '10px',
                          background: hoveredButton === `like-${result.id}` 
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                          border: 'none',
                          borderRadius: '50%',
                          fontSize: '18px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: hoveredButton === `like-${result.id}` ? 'scale(1.2)' : 'scale(1)'
                        }}
                        onMouseEnter={() => setHoveredButton(`like-${result.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        ❤️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              border: '2px dashed rgba(156, 163, 175, 0.3)'
            }}>
              <Search style={{
                width: '48px',
                height: '48px',
                color: '#d1d5db',
                margin: '0 auto 16px',
                display: 'block'
              }} />
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0,
                fontWeight: '500'
              }}>
                No results found for "{searchQuery}"
              </p>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ✨ Trending Now
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
                fontWeight: '400'
              }}>
                Discover what's popular in fashion
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {[
                { emoji: '🔥', tag: '#StreetStyle', posts: '125k posts', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)', border: 'rgba(251, 191, 36, 0.3)' },
                { emoji: '⭐', tag: '#OOTD', posts: '89k posts', gradient: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)', border: 'rgba(167, 139, 250, 0.3)' },
                { emoji: '🌟', tag: '#Vintage', posts: '67k posts', gradient: 'linear-gradient(135deg, #fce7f3 0%, #f472b6 100%)', border: 'rgba(244, 114, 182, 0.3)' },
                { emoji: '💎', tag: '#Luxury', posts: '45k posts', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #06b6d4 100%)', border: 'rgba(6, 182, 212, 0.3)' }
              ].map((item, index) => (
                <div 
                  key={index}
                  style={{
                    background: hoveredCard === `trending-${index}` 
                      ? 'rgba(255, 255, 255, 0.98)'
                      : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '16px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    boxShadow: hoveredCard === `trending-${index}`
                      ? '0 12px 32px rgba(0, 0, 0, 0.15)'
                      : '0 4px 16px rgba(0, 0, 0, 0.08)',
                    border: `2px solid ${item.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: hoveredCard === `trending-${index}` ? 'translateY(-4px) scale(1.02)' : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={() => setHoveredCard(`trending-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: item.gradient,
                    opacity: hoveredCard === `trending-${index}` ? 0.1 : 0.05,
                    transition: 'opacity 0.3s ease'
                  }}></div>
                  <div style={{
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '12px',
                      filter: hoveredCard === `trending-${index}` ? 'brightness(1.2) scale(1.1)' : 'none',
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === `trending-${index}` ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {item.emoji}
                    </div>
                    <p style={{
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#1e293b',
                      margin: '0 0 6px 0',
                      lineHeight: '1.2'
                    }}>
                      {item.tag}
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '13px',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {item.posts}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <SocialBottomNav />
    </div>
  );
};

export default SearchPage;
