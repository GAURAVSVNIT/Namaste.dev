"use client"

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Don't show navbar on auth pages
  const isAuthPage = pathname.startsWith('/auth');
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
    </>
  );
}
