'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  TrendingUp,
  Flame,
  Search,
  Camera,
  Play,
  Heart,
  Eye,
  Star,
  Award
} from 'lucide-react';

const TrendingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingContent, setTrendingContent] = useState([]);
  const [stats, setStats] = useState({
    totalViews: '2.4M',
    totalLikes: '156K',
    totalCreators: '3.2K',
    growthRate: '+24%'
  });

  // Simulated trending data - replace with real API calls
  useEffect(() => {
    const generateTrendingData = () => {
      return Array.from({ length: 24 }, (_, index) => ({
        id: `trending-${index}`,
        type: ['look', 'reel', 'live'][index % 3],
        title: [
          'Minimalist Chic Vibes',
          'Street Style Revolution',
          'Vintage Glamour',
          'Boho Festival Look',
          'Corporate Elegance',
          'Summer Beach Vibes',
          'Urban Night Out',
          'Sustainable Fashion',
        ][index % 8],
        creator: `Creator${index + 1}`,
        image: `https://picsum.photos/400/400?random=${index + 100}`,
        views: Math.floor(Math.random() * 50000) + 10000,
        likes: Math.floor(Math.random() * 5000) + 500,
        comments: Math.floor(Math.random() * 500) + 50,
        trendingScore: Math.floor(Math.random() * 100) + 50,
        isVerified: Math.random() > 0.7,
        tags: ['trending', 'fashion', 'style', 'outfit'].slice(0, Math.floor(Math.random() * 4) + 1)
      }));
    };
    
    setTrendingContent(generateTrendingData());
  }, [sortBy, timeRange]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const TrendingCard = ({ item, rank }) => (
    <div style={{
      position: 'relative',
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    }}>
      {/* Rank Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        background: rank <= 3 
          ? 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {rank <= 3 && <Award style={{ width: '14px', height: '14px' }} />}
        #{rank}
      </div>

      {/* Content Type Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        background: item.type === 'look' 
          ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
          : item.type === 'reel' 
          ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}>
        {item.type === 'look' && <Camera style={{ width: '12px', height: '12px', marginRight: '4px' }} />}
        {item.type === 'reel' && <Play style={{ width: '12px', height: '12px', marginRight: '4px' }} />}
        {item.type === 'live' && <span style={{ marginRight: '4px' }}>🔴</span>}
        {item.type}
      </div>

      {/* Image */}
      <div style={{
        aspectRatio: '1',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img
          src={item.image}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        />
        
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
        className="gradient-overlay" />
        
        {/* Hover Stats */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: 0,
          transform: 'translateY(20px)',
          transition: 'all 0.3s ease',
          color: '#ffffff'
        }}
        className="hover-stats">
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
              <Eye style={{ width: '14px', height: '14px' }} />
              {formatNumber(item.views)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
              <Heart style={{ width: '14px', height: '14px' }} />
              {formatNumber(item.likes)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.title}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              {item.creator[0]}
            </div>
            <span style={{ fontWeight: '600' }}>{item.creator}</span>
            {item.isVerified && <Star style={{ width: '14px', height: '14px', color: '#fbbf24', fill: '#fbbf24' }} />}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            <TrendingUp style={{ width: '12px', height: '12px' }} />
            {item.trendingScore}
          </div>
        </div>

        {/* Tags */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: '10px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '8px'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        div:hover .gradient-overlay {
          opacity: 1;
        }
        div:hover .hover-stats {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '120px 20px 80px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '40%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '50%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          animation: 'float 12s ease-in-out infinite reverse'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Trending Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            padding: '12px 24px',
            borderRadius: '50px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Flame style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            <span style={{
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '16px'
            }}>What's Hot Right Now</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            color: '#ffffff',
            marginBottom: '24px',
            lineHeight: '1',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.02em'
          }}>
            Trending Fashion
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.5',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>
            Discover the hottest fashion trends and most viral looks from creators worldwide
          </p>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto 48px'
          }}>
            {[
              { label: 'Total Views', value: stats.totalViews, icon: Eye },
              { label: 'Total Likes', value: stats.totalLikes, icon: Heart },
              { label: 'Active Creators', value: stats.totalCreators, icon: Star },
              { label: 'Growth Rate', value: stats.growthRate, icon: TrendingUp }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <Icon style={{
                    width: '24px',
                    height: '24px',
                    color: '#ffffff',
                    marginBottom: '8px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }} />
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>{stat.value}</div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '600'
                  }}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <Link href="/social/look/upload" style={{ textDecoration: 'none' }}>
              <button style={{
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
                boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.4)';
              }}>
                <Camera style={{ width: '20px', height: '20px' }} />
                Create Trending Look
              </button>
            </Link>
          </div>
        </div>

        {/* Floating Animation Keyframes */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-30px) rotate(1deg); }
            66% { transform: translateY(-15px) rotate(-1deg); }
          }
        `}</style>
      </section>

      {/* Search and Filter Section */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="🔥 Search trending styles, creators, hashtags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '20px 60px 20px 24px',
                borderRadius: '50px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.2)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Search style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
          </div>

          {/* Filter Controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="trending">🔥 Most Trending</option>
              <option value="newest">🆕 Newest First</option>
              <option value="popular">❤️ Most Popular</option>
              <option value="viewed">👁️ Most Viewed</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="day">📅 Today</option>
              <option value="week">📊 This Week</option>
              <option value="month">📈 This Month</option>
              <option value="all">🌟 All Time</option>
            </select>
          </div>
        </div>

        {/* Trending Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          padding: '20px 0'
        }}>
          {trendingContent.map((item, index) => (
            <TrendingCard key={item.id} item={item} rank={index + 1} />
          ))}
        </div>

        {/* Load More Button */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '50px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }}
          >
            Load More Trending Content
          </button>
        </div>
      </section>
    </div>
  );
};

export default TrendingPage;
