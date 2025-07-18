'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar({ face }) {
  const pathname = usePathname();
  
  // Debug logging to verify pathname
  console.log('ConditionalNavbar - Current pathname:', pathname);
  console.log('ConditionalNavbar - Should hide navbar:', pathname?.startsWith('/merchant-dashboard'));
  
  // Don't render navbar on merchant-dashboard pages
  if (pathname?.startsWith('/merchant-dashboard')) {
    console.log('ConditionalNavbar - Hiding navbar for merchant dashboard');
    return null;
  }
  
  console.log('ConditionalNavbar - Rendering navbar');
  
  return <Navbar face={face} />;
}
