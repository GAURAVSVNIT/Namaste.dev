import VirtualTryOn from '@/components/VirtualTryOn';

export const metadata = {
  title: 'Virtual Try-On Studio - Fashion Hub',
  description: 'Upload a person image and garment to generate a virtual try-on using AI',
};

export default function VirtualTryOnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blush via-mint to-lavender">
      <VirtualTryOn />
    </div>
  );
}
