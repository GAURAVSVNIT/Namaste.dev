'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, PlusCircle, Play, User } from 'lucide-react';

const BottomNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path) => pathname === path || pathname.startsWith(path);

  const navItems = [
    {
      icon: Home,
      label: 'Feed',
      path: '/social',
      isExact: true
    },
    {
      icon: Search,
      label: 'Search',
      path: '/social/search'
    },
    {
      icon: PlusCircle,
      label: 'Explore Look',
      path: '/social/look'
    },
    {
      icon: Play,
      label: 'Fashion TV',
      path: '/social/fashiontv'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/social/profile'
    }
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  // Don't render on live streaming page
  if (pathname === '/social/fashiontv/live') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-center items-center w-full">
        <div className="flex gap-6 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isExact ? pathname === item.path : isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] ${
                  active 
                    ? 'text-pink-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
