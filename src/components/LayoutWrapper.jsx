"use client"

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/ui/cart-sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Don't show navbar on auth pages or merchant dashboard pages
  const isAuthPage = pathname.startsWith('/auth');
  const isMerchantDashboard = pathname.startsWith('/merchant-dashboard');
  
  return (
    <>
      {!isAuthPage && !isMerchantDashboard && <Navbar />}
      {children}
      <CartSidebar />
    </>
  );
}
