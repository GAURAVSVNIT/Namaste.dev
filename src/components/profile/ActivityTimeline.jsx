'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, FileText, Calendar, Activity as ActivityIcon, Image, Play, UserPlus, UserMinus } from 'lucide-react';
import Link from 'next/link';

const ActivityItem = ({ activity }) => {
  const getIcon = (type, contentType) => {
    switch (type) {
      case 'liked':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'created':
        if (contentType === 'look') return <Image className="w-4 h-4 text-purple-500" />;
        if (contentType === 'reel') return <Play className="w-4 h-4 text-green-500" />;
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'updated':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'unfollow':
        return <UserMinus className="w-4 h-4 text-gray-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case 'liked':
        return 'liked';
      case 'created':
        return 'created';
      case 'updated':
        return 'updated';
      default:
        return 'performed an action on';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'liked':
        return 'bg-red-100 text-red-800';
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'updated':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp instanceof Date 
      ? timestamp 
      : new Date(timestamp?.seconds * 1000 || timestamp);
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '16px',
      borderLeft: '2px solid rgba(229, 231, 235, 0.5)'
    }}>
      <div style={{
        flexShrink: 0,
        width: '32px',
        height: '32px',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(229, 231, 235, 0.3)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        {getIcon(activity.type, activity.contentType)}
      </div>
      
      <div style={{
        flex: 1,
        minWidth: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <span style={{
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '9999px',
            backgroundColor: activity.type === 'liked' ? 'rgba(239, 68, 68, 0.1)' : 
                            activity.type === 'created' ? 'rgba(59, 130, 246, 0.1)' :
                            activity.type === 'updated' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
            color: activity.type === 'liked' ? 'rgb(153, 27, 27)' : 
                   activity.type === 'created' ? 'rgb(30, 64, 175)' :
                   activity.type === 'updated' ? 'rgb(21, 128, 61)' : 'rgb(75, 85, 99)',
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {activity.type}
          </span>
          <span style={{
            fontSize: '14px',
            color: 'rgb(107, 114, 128)'
          }}>
            {formatDate(activity.timestamp)}
          </span>
        </div>
        
        <p style={{
          fontSize: '14px',
          color: 'rgb(55, 65, 81)',
          lineHeight: '1.4'
        }}>
          {activity.type === 'follow' || activity.type === 'unfollow' ? (
            activity.description || (
              <>
                You {activity.type === 'follow' ? 'started following' : 'unfollowed'}{' '}
                <span style={{
                  fontWeight: '500',
                  color: 'rgb(59, 130, 246)'
                }}>
                  {activity.followingUsername || activity.details || 'a user'}
                </span>
              </>
            )
          ) : (
            <>
              You {getActionText(activity.type)}{' '}
              {activity.blogTitle ? (
                <Link 
                  href={`/blog/${activity.blogSlug || activity.blogId}`}
                  style={{
                    fontWeight: '500',
                    color: 'rgb(79, 70, 229)',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  "{activity.blogTitle}"
                </Link>
              ) : activity.lookTitle ? (
                <span style={{
                  fontWeight: '500',
                  color: 'rgb(147, 51, 234)'
                }}>
                  look "{activity.lookTitle}"
                </span>
              ) : activity.reelTitle ? (
                <span style={{
                  fontWeight: '500',
                  color: 'rgb(34, 197, 94)'
                }}>
                  reel "{activity.reelTitle}"
                </span>
              ) : activity.contentType === 'look' ? (
                <span style={{
                  fontWeight: '500',
                  color: 'rgb(147, 51, 234)'
                }}>a look</span>
              ) : activity.contentType === 'reel' ? (
                <span style={{
                  fontWeight: '500',
                  color: 'rgb(34, 197, 94)'
                }}>a reel</span>
              ) : (
                <span style={{ fontWeight: '500' }}>a blog post</span>
              )}
            </>
          )}
        </p>
        
        {activity.description && (
          <p style={{
            fontSize: '14px',
            color: 'rgb(107, 114, 128)',
            marginTop: '4px',
            lineHeight: '1.4'
          }}>
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function ActivityTimeline({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .loading-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}
        </style>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(229, 231, 235, 0.3)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }} className="loading-pulse">
            <div style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(229, 231, 235, 0.8)',
                borderRadius: '50%'
              }}></div>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  height: '16px',
                  backgroundColor: 'rgba(229, 231, 235, 0.8)',
                  borderRadius: '4px',
                  width: '25%'
                }}></div>
                <div style={{
                  height: '12px',
                  backgroundColor: 'rgba(229, 231, 235, 0.8)',
                  borderRadius: '4px',
                  width: '75%'
                }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 0'
      }}>
        <div style={{
          margin: '0 auto 16px',
          width: '96px',
          height: '96px',
          background: 'rgba(243, 244, 246, 0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 0.3)'
        }}>
          <ActivityIcon style={{ width: '48px', height: '48px', color: 'rgb(156, 163, 175)' }} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '500',
          color: 'rgb(17, 24, 39)',
          marginBottom: '8px'
        }}>No Activity Yet</h3>
        <p style={{
          color: 'rgb(107, 114, 128)',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          Start creating looks, reels, and interacting with content to see your activities here.
        </p>
        <Link href="/social/look/upload">
          <button style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.9), rgba(147, 51, 234, 0.9))',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
          }}>
            Create a Look
          </button>
        </Link>
      </div>
    );
  }

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = a.timestamp instanceof Date 
      ? a.timestamp 
      : new Date(a.timestamp?.seconds * 1000 || a.timestamp);
    const dateB = b.timestamp instanceof Date 
      ? b.timestamp 
      : new Date(b.timestamp?.seconds * 1000 || b.timestamp);
    return dateB - dateA;
  });

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Badge variant="secondary" className="ml-auto">
          {activities.length}
        </Badge>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedActivities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
