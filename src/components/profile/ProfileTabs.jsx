'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Heart, Activity, ShoppingCart } from 'lucide-react';

export default function ProfileTabs() {
  const pathname = usePathname();
  
  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      href: '/profile',
      icon: User
    },
    {
      value: 'orders',
      label: 'My Orders',
      href: '/profile/orders',
      icon: ShoppingCart
    },
    {
      value: 'blogs',
      label: 'My Blogs',
      href: '/profile/blogs',
      icon: FileText
    },
    {
      value: 'liked',
      label: 'Liked Blogs',
      href: '/profile/liked',
      icon: Heart
    },
    {
      value: 'activity',
      label: 'Activity',
      href: '/profile/activity',
      icon: Activity
    }
  ];
  
  const getCurrentTab = () => {
    if (pathname === '/profile') return 'overview';
    if (pathname === '/profile/orders') return 'orders';
    if (pathname === '/profile/blogs') return 'blogs';
    if (pathname === '/profile/liked') return 'liked';
    if (pathname === '/profile/activity') return 'activity';
    return 'overview';
  };
  
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '8px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '4px',
        width: '100%'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = getCurrentTab() === tab.value;
          
          return (
            <Link key={tab.value} href={tab.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 8px',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: isActive 
                  ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' 
                  : 'transparent',
                color: isActive ? 'white' : '#6B7280',
                boxShadow: isActive ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                transform: isActive ? 'translateY(-1px)' : 'none'
              }} onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.target.style.color = '#3B82F6';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }} onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6B7280';
                  e.target.style.transform = 'none';
                }
              }}>
                <Icon style={{ width: '16px', height: '16px' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: window.innerWidth < 640 ? 'none' : 'inline'
                }}>
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
