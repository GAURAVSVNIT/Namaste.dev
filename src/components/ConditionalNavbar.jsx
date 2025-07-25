'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar({ face }) {
  const pathname = usePathname();
  
  // Skip rendering for API routes and non-page routes
  if (!pathname || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return null;
  }
  
  // Debug logging to verify pathname (only for actual pages)
  console.log('ConditionalNavbar - Current pathname:', pathname);
  
  const shouldHideNavbar = pathname.startsWith('/merchant-dashboard') || pathname.startsWith('/tailor-dashboard');
  
  console.log('ConditionalNavbar - Should hide navbar:', shouldHideNavbar);
  
  // Don't render navbar on dashboard pages
  if (shouldHideNavbar) {
    console.log('ConditionalNavbar - Hiding navbar for dashboard page');
    return null;
  }
  
  console.log('ConditionalNavbar - Rendering navbar');
  
  return <Navbar face={face} />;
}
