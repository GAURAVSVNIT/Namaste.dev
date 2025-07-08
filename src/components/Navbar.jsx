"use client"

import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../static/Navbar.css'
import Link from 'next/link';
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
import { User, LogOut, Settings } from 'lucide-react';

export default function Navbar(fontFace) {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Use the auth hook
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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
  }, [User, authLoading]);

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
    { name: 'Blog', route: "blog" },
    { name: 'Social Media', route: "social" },
    { name: 'Market Place', route: "marketplace" },
    { name: 'Quiz', route: "quiz" },
    { name: 'Virtual Try-On', route: "virtual-tryon" },
    { name: 'Upload Look', route: "/" },
  ];

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
          className="w-56 bg-white border border-gray-200 shadow-lg rounded-md p-1" 
          align="end" 
          sideOffset={12}
          style={{ zIndex: 10000 }}
          container={typeof window !== 'undefined' ? document.body : undefined}
        >
          <div className="flex items-center justify-start gap-2 p-3 border-b border-gray-100">
            <SmartAvatar 
              user={userProfile} 
              className="h-8 w-8" 
              fallbackClassName="bg-gray-200 text-gray-700 text-sm"
            />
            <div className="flex flex-col space-y-1 leading-none flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {userProfile.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.email}
              </p>
              <div className="mt-1">
                <RoleBadge role={userProfile.role} size="sm" />
              </div>
            </div>
          </div>
          
          <DropdownMenuItem asChild className="focus:bg-gray-50">
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="focus:bg-gray-50">
            <Link href="/profile/blogs" className="flex items-center gap-2 cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Settings className="h-4 w-4" />
              <span>My Blogs</span>
            </Link>
          </DropdownMenuItem>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
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
            <i className="fas fa-tshirt logo-icon"></i>
            FashionHub
          </Link>

          {isMobile ? (
            <>
              <button className="mobile-menu-btn" onClick={toggleMenu}>
                <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
              </button>

              <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
                <ul className="mobile-nav-links">
                  {navItems.map((item, index) => (
                    <li key={index} className="mobile-nav-item">
                      <Link href={`/${item.route.replace(/^\/+/, "")}`} className="mobile-nav-link">{item.name}</Link>
                    </li>
                  ))}
                </ul>
                <div className="mobile-auth-buttons">
                  <Link href="/auth/login" className="login-btn">Login</Link>
                  <Link href="/auth/signup" className="signup-btn">Sign Up</Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <ul className="nav-links">
                {navItems.map((item, index) => (
                  <li key={index} className="nav-item">
                    <Link href={`/${item.route.replace(/^\/+/, "")}`} className="nav-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="auth-buttons">
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
          )}
        </div>
      </nav>
    </>
  );
}
