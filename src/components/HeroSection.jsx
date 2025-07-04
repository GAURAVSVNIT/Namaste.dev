"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const slides = [
    {
      title: "Summer '25 Collection",
      subtitle: "Embrace the Future of Fashion",
      description: "Discover our latest sustainable streetwear designed for the next generation",
      image: "photo-1649972904349-6e44c42644a7",
      cta: "Shop Collection"
    },
    {
      title: "Festival Ready",
      subtitle: "Stand Out in the Crowd",
      description: "Bold prints and vibrant colors for unforgettable moments",
      image: "photo-1581091226825-a6a2a5aee158",
      cta: "Explore Looks"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"
          style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}
        />
        <div 
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
          style={{ transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`, animationDelay: '1s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse-glow"
          style={{ transform: `translate(-50%, -50%) translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="space-y-4">
              <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">
                {slides[currentSlide].subtitle}
              </p>
              <h1 className="text-5xl lg:text-7xl font-clash font-bold leading-tight">
                <span className="text-gradient">
                  {slides[currentSlide].title}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                {slides[currentSlide].description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="btn-3d text-lg px-8 py-4">
                {slides[currentSlide].cta}
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 border-2 border-purple-200 hover:bg-purple-50 transition-all duration-300">
                View Lookbook
              </Button>
            </div>

            <div className="flex justify-center lg:justify-start space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-gradient-to-r from-pink-400 to-purple-500 w-8' : 'bg-gray-300'}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative group">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/10 to-green-400/10 rounded-3xl transform -rotate-6 group-hover:-rotate-12 transition-transform duration-700" />
                
                <div className="relative glass-card rounded-3xl overflow-hidden transform group-hover:scale-105 transition-all duration-700">
                  <img
                    src={`https://images.unsplash.com/${slides[currentSlide].image}?w=600&h=600&fit=crop&crop=center`}
                    alt="Fashion Model"
                    className="w-full h-full object-cover animate-rotate-3d"
                    style={{ animationDuration: '20s' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-bounce-in opacity-80" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-full animate-bounce-in opacity-60" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
};

export default HeroSection;
