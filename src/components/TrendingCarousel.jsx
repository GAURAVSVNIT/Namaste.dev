"use client";
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TrendingCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const collections = [
    { id: 1, name: "Streetwear Essentials", description: "Urban-inspired pieces for everyday style", image: "photo-1526374965328-7f61d4dc18c5", itemCount: 24, color: "from-orange-400 to-pink-500" },
    { id: 2, name: "Summer Vibes", description: "Light, breezy fits for sunny days", image: "photo-1487058792275-0ad4aaf24ca7", itemCount: 18, color: "from-blue-400 to-teal-500" },
    { id: 3, name: "Festival Drop", description: "Bold statements for music lovers", image: "photo-1605810230434-7631ac76ec81", itemCount: 32, color: "from-purple-400 to-pink-500" },
    { id: 4, name: "Minimalist Core", description: "Clean lines, maximum impact", image: "photo-1485827404703-89b55fcc595e", itemCount: 16, color: "from-gray-400 to-blue-500" }
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % collections.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-clash font-bold mb-4">
            <span className="text-gradient">Trending Collections</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collections designed for your lifestyle
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-3xl">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {collections.map((collection) => (
                <div key={collection.id} className="w-full flex-shrink-0">
                  <div className="relative h-96 lg:h-[500px] group cursor-pointer">
                    <img src={`https://images.unsplash.com/${collection.image}?w=1200&h=600&fit=crop&crop=center`} alt={collection.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${collection.color} opacity-60 group-hover:opacity-70 transition-opacity duration-500`} />
                    <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                      <div className="space-y-6 px-4">
                        <div className="space-y-2">
                          <h3 className="text-3xl lg:text-5xl font-clash font-bold">{collection.name}</h3>
                          <p className="text-lg lg:text-xl opacity-90">{collection.description}</p>
                          <p className="text-sm opacity-80">{collection.itemCount} pieces</p>
                        </div>
                        <Button className="btn-3d transform group-hover:scale-105 transition-transform duration-300">Shop Collection</Button>
                      </div>
                    </div>
                    <div className="absolute top-8 right-8 w-4 h-4 bg-white/30 rounded-full animate-ping" />
                    <div className="absolute bottom-8 left-8 w-6 h-6 bg-white/20 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" size="icon" className="absolute left-4 top-1/2 transform -translate-y-1/2 glass-card border-white/30 text-white hover:bg-white/20 transition-all duration-300" onClick={prevSlide}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="absolute right-4 top-1/2 transform -translate-y-1/2 glass-card border-white/30 text-white hover:bg-white/20 transition-all duration-300" onClick={nextSlide}>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="flex justify-center space-x-2 mt-8">
            {collections.map((_, index) => (
              <button key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-gradient-to-r from-pink-400 to-purple-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} onClick={() => setCurrentIndex(index)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCarousel;
