'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, UserCheck, UserPlus, MessageCircle } from 'lucide-react';
import { getUserSocialData, getUserByUsername, toggleFollow } from '@/lib/social';
import { useAuth } from '@/hooks/useAuth';

const UserCard = ({ user, currentUserId, onFollowToggle, isFollowing: initialFollowing }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUserId || user.id === currentUserId) return;
    
    setLoading(true);
    try {
      const followed = await toggleFollow(currentUserId, user.id);
      setIsFollowing(followed);
      onFollowToggle(user.id, followed);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    }}>
      {/* Avatar */}
      <div style={{
        position: 'relative'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          padding: '2px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
        }}>
          <img
            src={user.avatar || user.photoURL || "/api/placeholder/150/150"}
            alt={user.username || user.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid white'
            }}
          />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '16px',
          height: '16px',
          background: '#10b981',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }} />
      </div>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 4px 0',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {user.username || user.name || 'Unknown User'}
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {user.bio || 'No bio available'}
        </p>
        {user.followersCount !== undefined && (
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '4px 0 0 0'
          }}>
            {user.followersCount} followers
          </p>
        )}
      </div>

      {/* Action Button */}
      {currentUserId && user.id !== currentUserId && (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            background: isFollowing ? 'rgba(107, 114, 128, 0.1)' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: isFollowing ? '#374151' : 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-1px)';
              if (isFollowing) {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.color = '#dc2626';
              }
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.background = isFollowing ? 'rgba(107, 114, 128, 0.1)' : 'linear-gradient(135deg, #667eea, #764ba2)';
              e.target.style.color = isFollowing ? '#374151' : 'white';
            }
          }}
        >
          {loading ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : isFollowing ? (
            <>
              <UserCheck size={16} />
              Following
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Follow
            </>
          )}
        </button>
      )}
    </div>
  );
};

const FollowersModal = ({ isOpen, onClose, userId, type = 'followers' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserFollowing, setCurrentUserFollowing] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get user's social data to get followers/following IDs
      const userData = await getUserSocialData(userId);
      const userIds = type === 'followers' ? userData.followers : userData.following;

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch detailed info for each user
      const usersData = [];
      const followingSet = new Set();

      // If current user is logged in, get their following list
      if (user) {
        const currentUserData = await getUserSocialData(user.uid);
        currentUserData.following.forEach(id => followingSet.add(id));
        setCurrentUserFollowing(followingSet);
      }

      for (const id of userIds) {
        try {
          const userData = await getUserSocialData(id);
          usersData.push({
            id,
            username: userData.username,
            name: userData.username,
            bio: userData.bio,
            avatar: userData.avatar,
            followersCount: userData.followers.length
          });
        } catch (error) {
          console.error(`Error fetching user ${id}:`, error);
        }
      }

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = (userId, isFollowing) => {
    setCurrentUserFollowing(prev => {
      const newSet = new Set(prev);
      if (isFollowing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes slideUp {
            0% { transform: translate(-50%, -40%) scale(0.95); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}
      </style>
      
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out',
          overflow: 'hidden'
        }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255,255,255,0.3)',
          zIndex: 10000,
          animation: 'slideUp 0.4s ease-out',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}>
              <Users style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {type === 'followers' ? 'Followers' : 'Following'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0'
              }}>
                {users.length} {type === 'followers' ? 'followers' : 'following'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(107, 114, 128, 0.1)',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(107, 114, 128, 0.1)';
              e.target.style.color = '#6b7280';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(80vh - 120px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '40px 0'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(102, 126, 234, 0.3)',
                borderTop: '3px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0'
              }}>
                Loading {type}...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 16px',
                background: 'rgba(229, 231, 235, 0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>
                No {type} yet
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0'
              }}>
                {type === 'followers' 
                  ? 'When people follow this user, they\'ll appear here.'
                  : 'When this user follows people, they\'ll appear here.'
                }
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {users.map((userItem) => (
                <UserCard
                  key={userItem.id}
                  user={userItem}
                  currentUserId={user?.uid}
                  onFollowToggle={handleFollowToggle}
                  isFollowing={currentUserFollowing.has(userItem.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Use portal to render modal at document root level
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default FollowersModal;
