'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import styles from "@/static/layout/chatbotButton.module.css"
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import Link from 'next/link';
import { Bot } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '600'],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isFashionTV = pathname?.startsWith('/social/fashiontv');

  if (isFashionTV) {
    // Fashion TV gets full-screen experience without navbar/footer
    return (
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Script 
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />
        </body>
      </html>
    );
  }

  // All other pages get normal layout
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>
          <ConditionalNavbar face={poppins.className} />
          {children}
          <ConditionalFooter face={poppins.className} />
        </LayoutWrapper>

        {/* Chatbot Button */}
        <Link href="/chatbot" className={styles.chatbotBtn}>
          <Bot size={20} className={styles.icon} />
          <span className={styles.label}>AI Fashion Advicer</span>
        </Link>

        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
