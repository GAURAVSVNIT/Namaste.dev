import VirtualTryOn from '@/components/VirtualTryOn';

export const metadata = {
  title: 'Virtual Try-On Studio - Fashion Hub',
  description: 'Upload a person image and garment to generate a virtual try-on using AI',
};

export default function VirtualTryOnPage() {
  return (
    <div className="virtual-tryon-layout" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <VirtualTryOn />
    </div>
  );
}
