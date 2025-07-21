'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter({ face }) {
  const pathname = usePathname();
  
  // Don't render footer on merchant-dashboard pages
  if (pathname?.startsWith('/merchant-dashboard')) {
    return null;
  }
  
  return <Footer face={face} />;
}
