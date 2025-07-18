'use client';

import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";

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
  const isFashionTV = pathname?.startsWith('/fashiontv');

  if (isFashionTV) {
    // Fashion TV gets full-screen experience without navbar/footer
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  // All other pages get normal layout
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>
          <ConditionalNavbar face={poppins.className} />
          {children}
          <ConditionalFooter face={poppins.className} />
        </LayoutWrapper>
      </body>
    </html>
  );
}
