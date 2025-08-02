"use client"

import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../static/Navbar.css'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/user';
import { logOut } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SmartAvatar from '@/components/ui/smart-avatar';
import RoleBadge from '@/components/ui/role-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, ShoppingCart, Sparkle, Sparkles, Shield } from 'lucide-react';
import { isAdmin } from '@/lib/roles';
import useCartStore from '@/store/cart-store';

export default function Navbar(fontFace) {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Use the auth hook
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  // Get current pathname
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1024); // Increased breakpoint for better tablet experience
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Load user profile when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user, authLoading]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserById(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setUserProfile(null);
      setMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    // { name: 'Home'},
    { name: 'StyleSphere', route: "social" },
    { name: 'Market Place', route: "marketplace" },
{ name: 'Quiz', route: "quiz" },
    { name: 'Avataraa', route: "avatars" },
    { name: 'Virtual Try-On', route: "virtual-tryon" },
    { name: 'Consultation', route: "consultation" },
    { name: 'Blog', route: "blog" }
  ];

  const { openCart, getCartCount } = useCartStore();
  const cartCount = getCartCount();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const ProfileMenu = () => {
    if (!userProfile) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
            <SmartAvatar 
              user={userProfile} 
              className="h-10 w-10" 
              fallbackClassName="bg-gray-200 text-gray-700"
            />
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={12}
            style={{ 
              zIndex: 10000,
              width: '320px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05)',
              padding: '8px'
            }}
            container={typeof window !== 'undefined' ? document.body : undefined}
          >
            {/* User Info Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              marginBottom: '8px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.7)'
            }}>
              <div style={{ position: 'relative' }}>
                <SmartAvatar 
                  user={userProfile} 
                  className="h-12 w-12" 
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }}
                  fallbackClassName="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-semibold"
                />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  background: '#10B981',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.4)'
                }}></div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                flex: '1',
                minWidth: '0'
              }}>
                <p style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#111827',
                  margin: '0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userProfile.name || 'User'}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  margin: '0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userProfile.email}
                </p>
                <div style={{ marginTop: '6px' }}>
                  <RoleBadge role={userProfile.role} size="sm" style={{ padding: '6px 12px' }} />
                </div>
              </div>
            </div>

            
            {/* Navigation Links */}
            <div style={{ padding: '0 4px' }}>
              <DropdownMenuItem asChild>
                <Link href="/profile" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  background: 'transparent'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))';
                  e.target.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0px)';
                }}>
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    color: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    <User style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '2px' }}>Profile</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Manage your account</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/profile/orders" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  background: 'transparent'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))';
                  e.target.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0px)';
                }}>
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                    color: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    <ShoppingCart style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '2px' }}>My Orders</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Track your purchases</div>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/avatars" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  background: 'transparent'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))';
                  e.target.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0px)';
                }}>
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #FACC15, #F97316, #EF4444)',
                    color: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '2px' }}>My Avatars</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Express Yourself in 3D.</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/profile/blogs" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  background: 'transparent'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))';
                  e.target.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0px)';
                }}>
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #22C55E, #10B981)',
                    color: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    <Settings style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '2px' }}>My Blogs</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Your published content</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              
              {/* Admin Panel - Only show for admin users */}
              {isAdmin(userProfile) && (
                <DropdownMenuItem asChild>
                  <Link href="/admin-dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px',
                    background: 'transparent'
                  }} onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))';
                    e.target.style.transform = 'translateY(-1px)';
                  }} onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0px)';
                  }}>
                    <div style={{
                      padding: '10px',
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: 'white',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      transition: 'all 0.2s ease'
                    }}>
                      <Shield style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '2px' }}>Admin Panel</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Manage platform & dashboards</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}
            </div>
            
            {/* Separator */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.4), transparent)',
              margin: '12px 8px'
            }}></div>
            
            {/* Logout */}
            <DropdownMenuItem 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                margin: '0 4px',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                background: 'transparent',
                cursor: 'pointer',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(236, 72, 153, 0.1))';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #EF4444, #EC4899)',
                color: 'white',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s ease'
              }}>
                <LogOut style={{ width: '16px', height: '16px' }} />
              </div>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px', color: '#DC2626', marginBottom: '2px' }}>Log out</div>
                <div style={{ fontSize: '12px', color: '#F87171' }}>Sign out of your account</div>
              </div>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ` + fontFace}>
        <div className="navbar-container">
          <Link href="/" className="logo">
            <div className="logo-container">
              <img 
                src="/logo-home.png" 
                alt="FashionHub Logo" 
                className="logo-image"
              />
            </div>
          </Link>

          {isClient && (
            isMobile ? (
            <>
              <div className="mobile-nav-actions">
                <button 
                  className="cart-icon-btn mobile-cart" 
                  onClick={openCart}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="cart-badge">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button 
                  className="mobile-menu-btn" 
                  onClick={toggleMenu}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    position: 'relative',
                    zIndex: 1001,
                    color: '#333'
                  }}
                >
                  <i className={menuOpen ? "fas fa-times" : "fas fa-bars"} style={{ fontSize: '24px' }}></i>
                </button>
              </div>

              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: menuOpen ? 0 : '-100vw',
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  transition: 'right 0.3s ease-in-out',
                  zIndex: 1000,
                  display: menuOpen ? 'flex' : 'none',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '80px 20px 40px',
                  overflowY: 'auto',
                  visibility: menuOpen ? 'visible' : 'hidden',
                  opacity: menuOpen ? 1 : 0
                }}
              >
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center' }}>
                  {navItems.map((item, index) => {
                    // Check if current route matches the nav item for mobile too
                    const isActive = pathname === `/${item.route}` || 
                                   (pathname.startsWith(`/${item.route}/`) && item.route !== '');
                    
                    return (
                      <li key={index} style={{ marginBottom: '20px' }}>
                        <Link
                          href={`/${item.route.replace(/^\/+/, "")}`}
                          onClick={() => setMenuOpen(false)}
                          style={{
                            textDecoration: 'none',
                            color: isActive ? 'var(--primary)' : '#333',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            display: 'block',
                            padding: '15px 20px',
                            borderRadius: '15px',
                            background: isActive ? 'rgba(255, 77, 109, 0.15)' : 'transparent',
                            border: isActive ? '2px solid rgba(255, 77, 109, 0.3)' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            position: 'relative'
                          }}
                        >
                          {item.name}
                          {isActive && (
                            <div style={{
                              position: 'absolute',
                              right: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '8px',
                              height: '8px',
                              background: 'var(--primary)',
                              borderRadius: '50%',
                              boxShadow: '0 0 10px rgba(255, 77, 109, 0.6)'
                            }} />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div>
                  {pathname.startsWith('/marketplace') && (
                    <div style={{ marginBottom: '20px' }}>
                      <button
                        onClick={() => {
                          openCart();
                          setMenuOpen(false);
                        }}
                        style={{
                          background: '#333',
                          color: 'white',
                          border: 'none',
                          padding: '15px 20px',
                          borderRadius: '30px',
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}
                      >
                        <ShoppingCart style={{ marginRight: '10px' }} />
                        Shopping Cart
                        {cartCount > 0 && (
                          <span style={{ marginLeft: '10px', background: '#ef4444', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {cartCount}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    {isAuthenticated && userProfile ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          style={{
                            textDecoration: 'none',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            borderRadius: '30px',
                            background: 'rgba(0,0,0,0.05)',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                        >
                          <SmartAvatar
                            user={userProfile}
                            style={{ width: '30px', height: '30px' }}
                            fallbackClassName="bg-gray-200 text-gray-700"
                          />
                          <span>{userProfile.name || 'Profile'}</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid #333',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            color: '#333',
                            width: '100%'
                          }}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#333', border: '1px solid #333', padding: '10px 20px', borderRadius: '30px', width: '100%', textAlign: 'center' }}>Login</Link>
                        <Link href="/auth/signup" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', background: '#333', padding: '10px 20px', borderRadius: '30px', width: '100%', textAlign: 'center' }}>Sign Up</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <ul className="nav-links">
                {navItems.map((item, index) => {
                  // Check if current route matches the nav item
                  const isActive = pathname === `/${item.route}` || 
                                 (pathname.startsWith(`/${item.route}/`) && item.route !== '');
                  
                  return (
                    <li key={index} className="nav-item">
                      <Link 
                        href={`/${item.route.replace(/^\/+/, "")}`} 
                        className={`nav-link ${isActive ? 'active' : ''}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="auth-buttons">
                {pathname.startsWith('/marketplace') && (
                  <button 
                    className="cart-icon-btn" 
                    onClick={openCart}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      position: 'relative', 
                      cursor: 'pointer',
                      marginRight: '1rem',
                      padding: '0.5rem'
                    }}
                  >
                    <ShoppingCart className="h-6 w-6" style={{ color: '#333' }} />
                    {cartCount > 0 && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}
                {isAuthenticated && userProfile ? (
                  <ProfileMenu />
                ) : (
                  <>
                    <Link href="/auth/login" className="login-btn">Login</Link>
                    <Link href="/auth/signup" className="signup-btn">Sign Up</Link>
                  </>
                )}
              </div>
            </>
          )
          )}
        </div>
      </nav>
    </>
  );
}
