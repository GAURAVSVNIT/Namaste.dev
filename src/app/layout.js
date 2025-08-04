'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Geist, Geist_Mono, Poppins, Playfair_Display, Montserrat } from "next/font/google";
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

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isFashionTV = pathname?.startsWith('/social/fashiontv');
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomepage = pathname === '/';

  if (isFashionTV) {
    // Fashion TV gets full-screen experience without navbar/footer
    return (
      <html lang="en" suppressHydrationWarning={true}>
        {/* <!-- Google tag (gtag.js) --> */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-WYETEKYVWR"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date());

            gtag('config', 'G-WYETEKYVWR');
          </script>
        <body className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${montserrat.variable} antialiased gradient-background`}>
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
      {/* <!-- Google tag (gtag.js) --> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WYETEKYVWR"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          gtag('js', new Date());

          gtag('config', 'G-WYETEKYVWR');
        </script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${montserrat.variable} antialiased gradient-background`}
      >
        <LayoutWrapper>
          <ConditionalNavbar face={poppins.className} />
          {children}
          <ConditionalFooter face={poppins.className} />
        </LayoutWrapper>

        {/* Chatbot Button - show everywhere */}
        {(
          <Link href="/chatbot" className={styles.chatbotBtn}>
            <Bot size={20} className={styles.icon} />
            <span className={styles.label}>Zyra, AI Fashion Advicer</span>
          </Link>
        )}

        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
