'use client'

import { usePathname } from 'next/navigation';
import SocialBottomNav from '../../components/SocialBottomNav';

export default function SocialLayout({ children }) {
  const pathname = usePathname();
  
  // Hide bottom nav on live streaming and fashiontv pages
  const shouldShowBottomNav = !pathname.includes('/live') && !pathname.includes('/fashiontv');

  return (
    <div className="social-layout">
      <div className={shouldShowBottomNav ? 'pb-28' : ''}>
        {children}
      </div>
      {shouldShowBottomNav && <SocialBottomNav />}
    </div>
  );
}
