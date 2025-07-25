'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter({ face }) {
  const pathname = usePathname();
  
  // Skip rendering for API routes and non-page routes
  if (!pathname || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return null;
  }
  
  // Don't render footer on dashboard pages
  if (pathname.startsWith('/merchant-dashboard') || pathname.startsWith('/tailor-dashboard')) {
    return null;
  }
  
  return <Footer face={face} />;
}
