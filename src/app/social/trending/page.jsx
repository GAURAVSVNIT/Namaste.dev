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
    totalViews: '0',
    totalLikes: '0',
    totalCreators: '0',
    growthRate: '0%'
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        // Desktop: 3 items per row, 4 rows = 12 items
        setItemsPerPage(12);
      } else if (width >= 768) {
        // Tablet: 2 items per row, 4 rows = 8 items
        setItemsPerPage(8);
      } else {
        // Mobile: 1 item per row, 4 rows = 4 items
        setItemsPerPage(4);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Fetch real trending data from API
  useEffect(() => {
    const fetchTrendingData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/trending-content?sort=${sortBy}&timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending content');
        }
        
        const data = await response.json();
        
        // Filter to only include looks and reels
        const filteredData = data.filter(item => 
          item.type === 'look' || item.type === 'reel'
        );
        
        // Sort by likes first (descending), then by comments (descending) for tie-breaking
        const sortedData = filteredData.sort((a, b) => {
          if (b.likes !== a.likes) {
            return b.likes - a.likes; // Sort by likes (highest first)
          }
          return b.comments - a.comments; // If likes are equal, sort by comments (highest first)
        });
        
        setTrendingContent(sortedData);
        
        // Calculate real statistics from the fetched content
        calculateRealStats(sortedData);
      } catch (error) {
        console.error('Error fetching trending content:', error);
        // Fallback to empty array on error
        setTrendingContent([]);
        // Reset stats on error
        setStats({
          totalViews: '0',
          totalLikes: '0',
          totalCreators: '0',
          growthRate: '0%'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendingData();
  }, [sortBy, timeRange]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate real statistics from trending content
  const calculateRealStats = (contentData) => {
    if (!contentData || contentData.length === 0) {
      setStats({
        totalViews: '0',
        totalLikes: '0',
        totalCreators: '0',
        growthRate: '0%'
      });
      return;
    }

    // Calculate totals
    const totalViews = contentData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = contentData.reduce((sum, item) => sum + (item.likes || 0), 0);
    
    // Get unique creators
    const uniqueCreators = new Set(contentData.map(item => item.creator)).size;
    
    // Calculate growth rate based on trending scores
    const avgTrendingScore = contentData.length > 0 
      ? contentData.reduce((sum, item) => sum + (item.trendingScore || 0), 0) / contentData.length 
      : 0;
    const growthRate = Math.min(99, Math.max(0, avgTrendingScore));
    
    setStats({
      totalViews: formatNumber(totalViews),
      totalLikes: formatNumber(totalLikes),
      totalCreators: formatNumber(uniqueCreators),
      growthRate: `+${Math.round(growthRate)}%`
    });
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
          : 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)',
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
          ? 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)'
          : item.type === 'reel' 
          ? 'linear-gradient(135deg, var(--color-fashion-secondary) 0%, var(--color-fashion-primary) 100%)'
          : 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)',
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
          src={item.image || (item.type === 'reel' 
            ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center'
            : 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop')}
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
          onError={(e) => {
            // Fallback to appropriate placeholder if image fails to load
            if (item.type === 'reel') {
              // Use different placeholders for different reels to avoid all showing the same image
              const reelPlaceholders = [
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=400&fit=crop&crop=center'
              ];
              // Get consistent placeholder based on item id
              const hash = item.id.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
              }, 0);
              const index = Math.abs(hash) % reelPlaceholders.length;
              e.target.src = reelPlaceholders[index];
            } else {
              e.target.src = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop';
            }
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
              background: 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)',
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
            background: 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)',
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

  // Calculate pagination
  const filteredContent = trendingContent.filter(item => {
    if (!searchTerm) return true;
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredContent.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to content section smoothly
    window.scrollTo({
      top: 600,
      behavior: 'smooth'
    });
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          style={{
            padding: '12px 16px',
            margin: '0 4px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            background: '#ffffff',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = '#ef4444';
            e.target.style.color = '#ef4444';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Previous
        </button>
      );
    }

    // Add ellipsis if needed at the beginning
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          style={{
            padding: '12px 16px',
            margin: '0 4px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            background: '#ffffff',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = '#ef4444';
            e.target.style.color = '#ef4444';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis1" style={{ margin: '0 8px', color: '#6b7280' }}>...</span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            padding: '12px 16px',
            margin: '0 4px',
            borderRadius: '12px',
            border: currentPage === i ? '2px solid #ef4444' : '2px solid #e5e7eb',
            background: currentPage === i 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : '#ffffff',
            color: currentPage === i ? '#ffffff' : '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: currentPage === i ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: currentPage === i ? '0 8px 20px rgba(239, 68, 68, 0.3)' : 'none'
          }}
          onMouseOver={(e) => {
            if (currentPage !== i) {
              e.target.style.borderColor = '#ef4444';
              e.target.style.color = '#ef4444';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== i) {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.color = '#6b7280';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis if needed at the end
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis2" style={{ margin: '0 8px', color: '#6b7280' }}>...</span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{
            padding: '12px 16px',
            margin: '0 4px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            background: '#ffffff',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = '#ef4444';
            e.target.style.color = '#ef4444';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          style={{
            padding: '12px 16px',
            margin: '0 4px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            background: '#ffffff',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = '#ef4444';
            e.target.style.color = '#ef4444';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Next
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff'
    }}>
      <section style={{
        position: 'relative',
        padding: '120px 20px 80px',
        background: 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)',
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
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '50px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 35px rgba(239, 68, 68, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
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
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </section>

      {/* Search and Filter Section */}
      <section style={{
        padding: '60px 20px 0',
        maxWidth: '1400px',
        margin: '0 auto',
        background: '#ffffff'
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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            padding: '20px 0'
          }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #667eea',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            ))}
          </div>
        ) : filteredContent.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              padding: '20px 0'
            }}>
              {currentItems.map((item, index) => (
                <TrendingCard key={item.id} item={item} rank={startIndex + index + 1} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '48px',
                marginBottom: '0',
                padding: '32px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {renderPageNumbers()}
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                marginBottom: '0',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredContent.length)} of {filteredContent.length} trending items
              </div>
            )}
          </>
        ) : searchTerm ? (
          // No Search Results State
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '2px dashed rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
            }}>
              <Search size={48} style={{ color: 'white' }} />
            </div>
            
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              No Results Found
            </h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: '1.2rem',
              margin: '0 0 32px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              No trending content matches "{searchTerm}". Try different keywords or explore all trending content.
            </p>
            
            <button
              onClick={() => setSearchTerm('')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 12px 28px rgba(102, 126, 234, 0.3)'
              }}
            >
              <TrendingUp size={20} />
              View All Trending
            </button>
          </div>
        ) : (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '2px dashed rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
            }}>
              <TrendingUp size={48} style={{ color: 'white' }} />
            </div>
            
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              No Trending Content Yet
            </h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: '1.2rem',
              margin: '0 0 32px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Start creating amazing looks and reels to see them trending here!
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/social/look/upload" style={{ textDecoration: 'none' }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #9333ea, #a855f7)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 12px 28px rgba(147, 51, 234, 0.3)'
                }}>
                  <Camera size={20} />
                  Create Your First Look
                </button>
              </Link>
              
              <Link href="/social/reel/upload" style={{ textDecoration: 'none' }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 12px 28px rgba(102, 126, 234, 0.3)'
                }}>
                  <Play size={20} />
                  Create Your First Reel
                </button>
              </Link>
            </div>
          </div>
        )}

      </section>
    </div>
  );
};

export default TrendingPage;
