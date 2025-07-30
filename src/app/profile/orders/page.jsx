'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/lib/user';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ProfileOrdersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      router.push('auth/login');
      return;
    }
    
    loadUserData();
    loadOrders();
  }, [currentUser, authLoading]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(currentUser.uid);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Mock orders data - replace with actual API call
  const loadOrders = () => {
    const mockOrders = [
      {
        id: 'ORD-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 149.99,
        items: [
          { name: 'Premium Cotton T-Shirt', quantity: 2, price: 29.99 },
          { name: 'Denim Jacket', quantity: 1, price: 89.99 }
        ]
      },
      {
        id: 'ORD-002', 
        date: '2024-01-20',
        status: 'shipped',
        total: 79.99,
        items: [
          { name: 'Casual Sneakers', quantity: 1, price: 79.99 }
        ]
      },
      {
        id: 'ORD-003',
        date: '2024-01-22',
        status: 'processing',
        total: 199.99,
        items: [
          { name: 'Winter Coat', quantity: 1, price: 199.99 }
        ]
      }
    ];
    setOrders(mockOrders);
  };
  
  const handleUpdateProfile = async (updates) => {
    try {
      await updateUser(currentUser.uid, updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getStatusIcon = (status) => {
    const iconStyle = {
      width: '20px',
      height: '20px'
    };

    switch (status) {
      case 'delivered':
        return <CheckCircle style={{ ...iconStyle, color: '#10B981' }} />;
      case 'shipped':
        return <Truck style={{ ...iconStyle, color: '#3B82F6' }} />;
      case 'processing':
        return <Package style={{ ...iconStyle, color: '#F59E0B' }} />;
      case 'pending':
        return <Clock style={{ ...iconStyle, color: '#6B7280' }} />;
      default:
        return <AlertCircle style={{ ...iconStyle, color: '#EF4444' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          text: '#065F46',
          border: 'rgba(16, 185, 129, 0.2)'
        };
      case 'shipped':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          text: '#1E40AF',
          border: 'rgba(59, 130, 246, 0.2)'
        };
      case 'processing':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          text: '#92400E',
          border: 'rgba(245, 158, 11, 0.2)'
        };
      case 'pending':
        return {
          bg: 'rgba(107, 114, 128, 0.1)',
          text: '#374151',
          border: 'rgba(107, 114, 128, 0.2)'
        };
      default:
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          text: '#B91C1C',
          border: 'rgba(239, 68, 68, 0.2)'
        };
    }
  };
  
  if (authLoading || loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          <div style={{ 
            height: '160px', 
            background: '#E5E7EB', 
            borderRadius: '12px' 
          }}></div>
          <div style={{ 
            height: '48px', 
            background: '#E5E7EB', 
            borderRadius: '12px' 
          }}></div>
          <div style={{
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ 
                height: '200px', 
                background: '#E5E7EB', 
                borderRadius: '12px' 
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Profile Header */}
        {user && (
          <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />
        )}
        
        {/* Navigation Tabs */}
        <ProfileTabs />
        
        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #A855F7, #EC4899)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
          }}>
            <ShoppingCart style={{ 
              width: '24px', 
              height: '24px', 
              color: 'white' 
            }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #374151, #111827)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              My Orders
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: '0'
            }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} in your history
            </p>
          </div>
        </div>
        
        {/* Orders List */}
        {orders.length > 0 ? (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {orders.map((order) => {
              const statusColors = getStatusColor(order.status);
              
              return (
                <div key={order.id} style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                }} onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }}>
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 4px 0'
                      }}>
                        Order #{order.id}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: '0'
                      }}>
                        Placed on {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: statusColors.bg,
                      border: `1px solid ${statusColors.border}`,
                      borderRadius: '12px'
                    }}>
                      {getStatusIcon(order.status)}
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: statusColors.text,
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div style={{
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: index < order.items.length - 1 ? '1px solid rgba(229, 231, 235, 0.5)' : 'none'
                      }}>
                        <div style={{
                          flex: '1'
                        }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            margin: '0 0 4px 0'
                          }}>
                            {item.name}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: '#6B7280',
                            margin: '0'
                          }}>
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Total */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '2px solid rgba(229, 231, 235, 0.3)'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Total Amount
                    </span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#111827',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
              borderRadius: '50%',
              marginBottom: '24px'
            }}>
              <ShoppingCart style={{ 
                width: '40px', 
                height: '40px', 
                color: '#6B7280' 
              }} />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px 0'
            }}>
              No Orders Yet
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: '0 0 32px 0',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Start shopping to see your orders here. Explore our marketplace and find amazing products!
            </p>
            <button
              onClick={() => router.push('/marketplace')}
              style={{
                background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 35px rgba(168, 85, 247, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.3)';
              }}
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
