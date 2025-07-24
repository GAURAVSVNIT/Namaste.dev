"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Camera, 
  Tv, 
  Search, 
  User, 
  Home, 
  Play, 
  Heart, 
  MessageCircle, 
  Eye, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  ChevronLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  Plus,
  Share2,
  Bookmark,
  Send,
  MoreHorizontal,
  Zap,
  Flame
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAllLooks } from "@/lib/look";
import { getAllVideos } from "@/lib/fashiontv";
import { getApprovedLivestreams } from "@/lib/fashiontv";
import { toast } from "@/hooks/use-toast";
import { getPlaceholderImageUrl } from "@/components/ui/PlaceholderImage";

const SocialFeedPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [featuredLooks, setFeaturedLooks] = useState([]);
  const [featuredReels, setFeaturedReels] = useState([]);
  const [featuredStreams, setFeaturedStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  const navigateTo = (path) => {
    router.push(path);
  };

  // Load featured content on component mount
  useEffect(() => {
    const loadFashionFeed = async () => {
      try {
        setIsLoading(true);
        
        // Load latest looks, reels, and streams concurrently
        const [looksData, reelsData, streamsData] = await Promise.all([
          getAllLooks(12),
          getAllVideos(12),
          getApprovedLivestreams(8)
        ]);

        setFeaturedLooks(looksData || []);
        setFeaturedReels(reelsData?.videos || []);
        setFeaturedStreams(streamsData || []);
      } catch (error) {
        console.error('Error loading fashion feed:', error);
        toast({
          title: "Error",
          description: "Failed to load fashion feed. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFashionFeed();
  }, []);

  const QuickActionCard = ({ icon: Icon, title, subtitle, color, href, gradient }) => (
    <Link href={href} className="block">
      <div className={`relative bg-gradient-to-br ${gradient} rounded-3xl text-white group hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl`} style={{ padding: '24px', minHeight: '180px' }}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300" style={{ padding: '12px', marginBottom: '16px' }}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold" style={{ marginBottom: '4px' }}>{title}</h3>
          <p className="text-white/80 text-sm">{subtitle}</p>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
  );

  const ContentCard = ({ item, type }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative">
        <div className={`${type === 'reel' ? 'aspect-[9/16]' : type === 'stream' ? 'aspect-video' : 'aspect-square'} overflow-hidden`}>
          <img
            src={item.image || item.thumbnail || item.images?.[0] || `https://picsum.photos/${type === 'reel' ? '300/533' : '400/400'}?random=${Math.floor(Math.random() * 100)}`}
            alt={item.title || item.caption}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              // Multiple fallback options
              const fallbacks = [
                `https://picsum.photos/${type === 'reel' ? '300/533' : '400/400'}?random=${Math.floor(Math.random() * 1000)}`,
                `https://placehold.co/${type === 'reel' ? '300x533' : '400x400'}/8b5cf6/white?text=Fashion+${type === 'reel' ? 'Reel' : 'Look'}`,
                `https://via.placeholder.com/${type === 'reel' ? '300x533' : '400x400'}/8b5cf6/ffffff?text=Fashion`
              ];
              const currentIndex = e.target.dataset.fallbackIndex || 0;
              if (currentIndex < fallbacks.length - 1) {
                e.target.dataset.fallbackIndex = parseInt(currentIndex) + 1;
                e.target.src = fallbacks[parseInt(currentIndex) + 1];
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Overlay content */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <span style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: type === 'look' ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(219, 39, 119, 0.9))' : 
                       type === 'reel' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(124, 58, 237, 0.9))' : 
                       'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))'
          }}>
            {type === 'look' ? item.mood || 'Look' : 
             type === 'reel' ? 'Reel' : 
             'LIVE'}
          </span>
          <button style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            padding: '8px',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          className="group-hover:opacity-100">
            <MoreHorizontal style={{ width: '16px', height: '16px', color: '#ffffff' }} />
          </button>
        </div>

        {type === 'reel' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {type === 'stream' && (
          <div className="absolute top-3 right-3">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></div>
              LIVE
            </div>
          </div>
        )}

      </div>

      {/* Card content */}
      <div style={{ padding: '20px 24px' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {item.title || item.caption || `Fashion ${type} #${Math.floor(Math.random() * 100)}`}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              transition: 'all 0.2s ease'
            }}>
              <Heart style={{ width: '14px', height: '14px', color: '#ef4444' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#ef4444'
              }}>{item.likes?.length || Math.floor(Math.random() * 100)}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              transition: 'all 0.2s ease'
            }}>
              <MessageCircle style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#3b82f6'
              }}>{item.comments?.length || Math.floor(Math.random() * 50)}</span>
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            color: '#9ca3af',
            fontWeight: '500'
          }}>{Math.floor(Math.random() * 24)}h</span>
        </div>
      </div>
    </div>
  );

  const generatePlaceholderContent = (type, count) => {
    const fashionTitles = [
      "Summer Collection Highlights",
      "Street Style Inspiration",
      "Vintage Fashion Trends",
      "Designer Outfit Ideas",
      "Casual Chic Looks",
      "Evening Wear Elegance",
      "Minimalist Fashion",
      "Boho Style Guide",
      "Monochrome Outfits",
      "Seasonal Color Palette",
      "Sustainable Fashion",
      "Fashion Week Trends"
    ];

    const getPlaceholderImage = (index, contentType) => {
      const width = contentType === 'reel' ? 300 : contentType === 'stream' ? 400 : 400;
      const height = contentType === 'reel' ? 533 : contentType === 'stream' ? 225 : 400;
      
      let fashionKeywords;
      if (contentType === 'stream') {
        // Live stream specific keywords for fashion shows, runway, events
        fashionKeywords = ['runway', 'fashionshow', 'catwalk', 'fashion-event', 'designer', 'model-runway', 'fashion-week', 'backstage'];
      } else {
        // Regular fashion keywords for looks and reels
        fashionKeywords = ['fashion', 'style', 'outfit', 'trendy', 'chic', 'elegant', 'modern', 'look'];
      }
      
      const keyword = fashionKeywords[index % fashionKeywords.length];
      return `https://source.unsplash.com/${width}x${height}/?${keyword},fashion,model`;
    };

    return Array.from({ length: count }, (_, index) => ({
      id: `placeholder-${type}-${index}`,
      title: fashionTitles[index % fashionTitles.length],
      caption: fashionTitles[index % fashionTitles.length],
      image: getPlaceholderImage(index, type),
      thumbnail: getPlaceholderImage(index, type),
      likes: Array.from({ length: Math.floor(Math.random() * 150) + 20 }),
      comments: Array.from({ length: Math.floor(Math.random() * 45) + 5 }),
      views: Math.floor(Math.random() * 5000) + 500,
      isPlaceholder: true
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-pink-500"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Fashion Feed</h3>
          <p className="text-gray-600">Discovering the latest trends for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Content Area with top padding for main navbar */}
      <div className="pb-24" style={{ paddingTop: '100px' }}>
        
        {/* Hero Section */}
        <section style={{
          position: 'relative',
          marginBottom: '60px',
          padding: '80px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          borderRadius: '32px',
          margin: '0 20px 60px 20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(102, 126, 234, 0.4)'
        }}>
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-5%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite reverse'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            animation: 'float 10s ease-in-out infinite'
          }}></div>

          {/* Content Container */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              padding: '10px 20px',
              borderRadius: '50px',
              marginBottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <Flame style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              <span style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14px'
              }}>Trending Now</span>
            </div>

            {/* Main Title */}
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: '900',
              color: '#ffffff',
              marginBottom: '20px',
              lineHeight: '1.1',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em'
            }}>
              Fashion Feed
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '40px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 40px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
              Discover, create, and share the latest fashion trends with a vibrant community of style enthusiasts
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              {/* Search Button */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Search trends, looks, creators..."
                  style={{
                    width: 'min(400px, 80vw)',
                    padding: '16px 60px 16px 24px',
                    borderRadius: '50px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    color: '#2d3748',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  }}
                  onBlur={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                />
                <button style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#667eea',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#5a67d8';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}>
                  <Search style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                </button>
              </div>
            </div>

            {/* Create Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigateTo('/social/look/upload')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.05)';
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.4)';
                }}
              >
                <Camera style={{ width: '20px', height: '20px' }} />
                <span>Create Look</span>
              </button>

              <button
                onClick={() => navigateTo('/social/fashiontv/upload')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-3px) scale(1.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <Play style={{ width: '20px', height: '20px' }} />
                <span>Create Reel</span>
              </button>
            </div>
          </div>

          {/* Floating Animation Keyframes */}
          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              33% {
                transform: translateY(-20px) rotate(1deg);
              }
              66% {
                transform: translateY(-10px) rotate(-1deg);
              }
            }
          `}</style>
        </section>

        {/* Quick Actions */}
        <section style={{ padding: '32px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="text-2xl font-black text-gray-900" style={{ marginBottom: '8px' }}>Quick Actions</h2>
            <p className="text-gray-600">Start creating amazing fashion content</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '24px' }}>
            <QuickActionCard
              icon={Camera}
              title="Explore Looks"
              subtitle="Browse fashion styles"
              gradient="from-pink-500 to-purple-500"
              href="/social/look"
            />
            <QuickActionCard
              icon={Play}
              title="Create Reel"
              subtitle="Make fashion videos"
              gradient="from-pink-500 to-purple-500"
              href="/social/fashiontv"
            />
            <QuickActionCard
              icon={Tv}
              title="Go Live"
              subtitle="Stream fashion shows"
              gradient="from-pink-500 to-purple-500"
              href="/social/fashiontv/live"
            />
            <QuickActionCard
              icon={Zap}
              title="Trending"
              subtitle="What's hot now"
              gradient="from-pink-500 to-purple-500"
              href="/social/trending"
            />
          </div>
        </section>

        {/* Tab Navigation */}
        <section style={{ padding: '0 24px', marginBottom: '32px' }}>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg" style={{ padding: '8px' }}>
            <div className="flex" style={{ gap: '4px' }}>
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-pink-500 to-purple-500' },
              { id: 'looks', label: 'Looks', icon: Camera, color: 'from-pink-500 to-purple-500' },
              { id: 'reels', label: 'Reels', icon: Play, color: 'from-pink-500 to-purple-500' },
              { id: 'live', label: 'Live', icon: Tv, color: 'from-pink-500 to-purple-500' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                  style={{ padding: '16px 16px', gap: '8px' }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

        {/* Content Grid */}
        <section style={{ padding: '0 24px', paddingBottom: '128px' }}>
          {activeTab === 'trending' && (
            <div style={{ marginBottom: '32px' }}>
              {/* Mixed trending content */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                  <h3 className="text-xl font-black text-gray-900 flex items-center">
                    <TrendingUp className="w-6 h-6" style={{ marginRight: '8px', color: '#f97316' }} />
                    Trending Now
                  </h3>
                  <Link href="/social/trending" className="text-pink-600 font-semibold text-sm flex items-center hover:text-pink-700">
                    View All
                    <ChevronRight className="w-4 h-4" style={{ marginLeft: '4px' }} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" style={{ gap: '20px' }}>
                {featuredLooks.length > 0 ? featuredLooks.slice(0, 8).map((look, index) => (
                  <ContentCard key={`trending-look-${look.id || index}`} item={look} type="look" />
                )) : generatePlaceholderContent('look', 8).map((item, index) => (
                  <ContentCard key={`placeholder-look-${index}`} item={item} type="look" />
                ))}
              </div>
            </div>
          </div>
        )}

          {activeTab === 'looks' && (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <Camera className="w-6 h-6" style={{ marginRight: '8px', color: '#ec4899' }} />
                  Fashion Looks
                </h3>
                <Link href="/social/look" className="text-pink-600 font-semibold text-sm flex items-center hover:text-pink-700">
                  View All
                  <ChevronRight className="w-4 h-4" style={{ marginLeft: '4px' }} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" style={{ gap: '20px' }}>
              {featuredLooks.length > 0 ? featuredLooks.map((look, index) => (
                <ContentCard key={`look-${look.id || index}`} item={look} type="look" />
              )) : generatePlaceholderContent('look', 12).map((item, index) => (
                <ContentCard key={`placeholder-look-${index}`} item={item} type="look" />
              ))}
            </div>
          </div>
        )}

          {activeTab === 'reels' && (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <Play className="w-6 h-6" style={{ marginRight: '8px', color: '#8b5cf6' }} />
                  Fashion Reels
                </h3>
                <Link href="/social/fashiontv" className="text-purple-600 font-semibold text-sm flex items-center hover:text-purple-700">
                  View All
                  <ChevronRight className="w-4 h-4" style={{ marginLeft: '4px' }} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8" style={{ gap: '20px' }}>
              {featuredReels.length > 0 ? featuredReels.map((reel, index) => (
                <ContentCard key={`reel-${reel.id || index}`} item={reel} type="reel" />
              )) : generatePlaceholderContent('reel', 12).map((item, index) => (
                <ContentCard key={`placeholder-reel-${index}`} item={item} type="reel" />
              ))}
            </div>
          </div>
        )}

          {activeTab === 'live' && (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <Tv className="w-6 h-6" style={{ marginRight: '8px', color: '#ef4444' }} />
                  Live Streams
                </h3>
                <Link href="/social/fashiontv/live" className="text-red-600 font-semibold text-sm flex items-center hover:text-red-700">
                  View All
                  <ChevronRight className="w-4 h-4" style={{ marginLeft: '4px' }} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" style={{ gap: '20px' }}>
              {featuredStreams.length > 0 ? featuredStreams.map((stream, index) => (
                <ContentCard key={`stream-${stream.id || index}`} item={stream} type="stream" />
              )) : generatePlaceholderContent('stream', 10).map((item, index) => (
                <ContentCard key={`placeholder-stream-${index}`} item={item} type="stream" />
              ))}
            </div>

              {/* Call to Action for Live Streaming */}
              <div className="text-center" style={{ marginTop: '40px' }}>
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl text-white" style={{ padding: '40px' }}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-fit" style={{ padding: '20px', margin: '0 auto 20px' }}>
                  <Tv className="w-10 h-10" />
                </div>
                  <h3 className="text-3xl font-bold" style={{ marginBottom: '12px' }}>Start Your Live Stream</h3>
                  <p className="text-white/90 text-lg" style={{ marginBottom: '32px' }}>Share your fashion content with the world in real-time</p>
                  <button 
                    onClick={() => navigateTo('/social/fashiontv/live')}
                    className="bg-white text-red-600 rounded-xl font-bold hover:bg-gray-100 transition-colors text-lg"
                    style={{ padding: '16px 32px' }}
                  >
                  🎥 Go Live Now
                </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SocialFeedPage;
