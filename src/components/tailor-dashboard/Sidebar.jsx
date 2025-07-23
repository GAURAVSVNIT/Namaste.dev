'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  { name: 'Dashboard', href: '/tailor-dashboard', icon: HomeIcon },
  { name: 'Orders', href: '/tailor-dashboard/orders', icon: ClipboardDocumentListIcon },
  { name: 'Customers', href: '/tailor-dashboard/customers', icon: UserGroupIcon },
  { name: 'Analytics', href: '/tailor-dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/tailor-dashboard/settings', icon: CogIcon },
];

export default function TailorSidebar({ isCollapsed, onToggleCollapse, isMobileMenuOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? '80px' : '280px',
          x: isMobileMenuOpen ? 0 : '-100%'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed lg:relative top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          flex flex-col shadow-lg lg:shadow-none lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-gray-900">Tailor</span>
            )}
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onToggleCollapse}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Tailor Dashboard
                </p>
                <p className="text-xs text-gray-500">Professional</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
