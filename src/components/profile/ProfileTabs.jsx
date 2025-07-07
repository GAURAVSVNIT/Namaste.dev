'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Heart, Activity } from 'lucide-react';

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
    if (pathname === '/profile/blogs') return 'blogs';
    if (pathname === '/profile/liked') return 'liked';
    if (pathname === '/profile/activity') return 'activity';
    return 'overview';
  };
  
  return (
    <div className="w-full border-b">
      <Tabs value={getCurrentTab()} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link key={tab.value} href={tab.href} className="w-full">
                <TabsTrigger 
                  value={tab.value} 
                  className="w-full flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              </Link>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
