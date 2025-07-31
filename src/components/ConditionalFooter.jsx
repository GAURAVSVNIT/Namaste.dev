'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter({ face }) {
  const pathname = usePathname();
  
  // Skip rendering for API routes and non-page routes
  if (!pathname || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return null;
  }
  
  // Don't render footer on dashboard pages and auth pages
  if (pathname.startsWith('/merchant-dashboard') || pathname.startsWith('/fashion-creator-dashboard') || pathname.startsWith('/auth')) {
    return null;
  }
  
  return <Footer face={face} />;
}
