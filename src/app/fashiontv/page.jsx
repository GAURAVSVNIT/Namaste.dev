'use client';

import { useState } from 'react';
import VideoFeed from '@/components/fashiontv/VideoFeed';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Home } from 'lucide-react';

export default function FashionTVPage() {
  const { user } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleCommentsToggle = (isOpen) => {
    setIsCommentsOpen(isOpen);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Top Left Live Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/fashiontv/live">
          <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all">
            <span className="text-sm font-semibold">LIVE</span>
          </button>
        </Link>
      </div>

      {/* Top Right Home Button */}
      <div className="absolute top-4 right-4 z-50">
        <Link href="/">
          <button className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all">
            <Home className="w-6 h-6" />
          </button>
        </Link>
      </div>

      {/* Bottom Upload Button */}
      {user && (
        <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${
          isCommentsOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <Link href="/fashiontv/upload">
            <button className="bg-white text-black p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-200">
              <Plus className="w-8 h-8" />
            </button>
          </Link>
        </div>
      )}

      {/* Instagram-style Centered Video Feed */}
      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-md h-full">
          <VideoFeed onCommentsToggle={handleCommentsToggle} />
        </div>
      </div>
    </div>
  );
}
