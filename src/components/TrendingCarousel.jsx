"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TrendingCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const collections = [
    { id: 1, name: "Streetwear Essentials", description: "Urban-inspired pieces for everyday style", image: "photo-1526374965328-7f61d4dc18c5", itemCount: 24, color: "from-orange-400 to-pink-500" },
    { id: 2, name: "Summer Vibes", description: "Light, breezy fits for sunny days", image: "photo-1487058792275-0ad4aaf24ca7", itemCount: 18, color: "from-blue-400 to-teal-500" },
    { id: 3, name: "Festival Drop", description: "Bold statements for music lovers", image: "photo-1605810230434-7631ac76ec81", itemCount: 32, color: "from-purple-400 to-pink-500" },
    { id: 4, name: "Minimalist Core", description: "Clean lines, maximum impact", image: "photo-1485827404703-89b55fcc595e", itemCount: 16, color: "from-gray-400 to-blue-500" },
    { id: 5, name: "Winter Cozy", description: "Warm layers for cold adventures", image: "photo-1551698618-1dfe5d97d256", itemCount: 28, color: "from-indigo-400 to-cyan-500" },
    { id: 6, name: "Athletic Edge", description: "Performance meets street style", image: "photo-1571019613454-1cb2f99b2d8b", itemCount: 22, color: "from-emerald-400 to-yellow-500" }
  ];

  // Auto-rotation functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % collections.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, collections.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % collections.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Pause auto-rotation for 8 seconds after manual navigation
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Pause auto-rotation for 8 seconds after manual navigation
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Pause auto-rotation for 8 seconds after manual navigation
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    setIsPaused(false);
  };

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
          {/* Auto-play control */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="glass-card border-white/30 text-white hover:bg-white/20 transition-all duration-300"
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <div 
              className="flex transition-all duration-1000 ease-in-out transform" 
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                willChange: 'transform'
              }}
            >
              {collections.map((collection, index) => (
                <div key={collection.id} className="w-full flex-shrink-0">
                  <div className="relative h-96 lg:h-[500px] group cursor-pointer overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/${collection.image}?w=1200&h=600&fit=crop&crop=center`} 
                      alt={collection.name} 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 filter group-hover:brightness-110" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${collection.color} opacity-60 group-hover:opacity-70 transition-all duration-500`} />
                    
                    {/* Progress indicator for current slide */}
                    {index === currentIndex && isAutoPlaying && !isPaused && (
                      <div className="absolute top-0 left-0 h-1 bg-white/30 w-full">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-4000 ease-linear"
                          style={{
                            width: '0%',
                            animation: 'progress 4s linear infinite'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                      <div className="space-y-6 px-4 transform transition-all duration-700 group-hover:scale-105">
                        <div className="space-y-2">
                          <h3 className="text-3xl lg:text-5xl font-clash font-bold drop-shadow-lg">{collection.name}</h3>
                          <p className="text-lg lg:text-xl opacity-90 drop-shadow-md">{collection.description}</p>
                          <p className="text-sm opacity-80 drop-shadow-sm">{collection.itemCount} pieces</p>
                        </div>
                        <Button className="btn-3d transform group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                          Shop Collection
                        </Button>
                      </div>
                    </div>
                    
                    {/* Animated decorations */}
                    <div className="absolute top-8 right-8 w-4 h-4 bg-white/30 rounded-full animate-ping" />
                    <div className="absolute bottom-8 left-8 w-6 h-6 bg-white/20 rounded-full animate-pulse" />
                    <div className="absolute top-1/3 left-12 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute bottom-1/3 right-16 w-3 h-3 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Navigation Buttons */}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 glass-card border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl z-10" 
            onClick={prevSlide}
            disabled={collections.length <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 glass-card border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl z-10" 
            onClick={nextSlide}
            disabled={collections.length <= 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Enhanced Dot Indicators */}
          <div className="flex justify-center space-x-3 mt-8">
            {collections.map((_, index) => (
              <button 
                key={index} 
                className={`relative transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 h-3 bg-gradient-to-r from-pink-400 to-purple-500 scale-125 shadow-lg' 
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-110'
                } rounded-full`} 
                onClick={() => goToSlide(index)}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCarousel;
