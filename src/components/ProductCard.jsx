"use client";
import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isNew = false,
  colors = ['#FF6B9D', '#4ECDC4', '#A8E6CF']
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    console.log('Added to cart:', id);
  };

  return (
    <div 
      className="group relative floating-card glass-card p-4 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
      )}

      {isNew && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          NEW
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300"
        onClick={() => setIsLiked(!isLiked)}
      >
        <Heart 
          className={`h-4 w-4 transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} 
        />
      </Button>

      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={`https://images.unsplash.com/${image}?w=400&h=400&fit=crop&crop=center`}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 rotate-2' : 'scale-100'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
          <h3 className="font-clash font-semibold text-lg leading-tight">{name}</h3>
        </div>

        <div className="flex items-center space-x-2">
          {colors.map((color, index) => (
            <button
              key={index}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${selectedColor === index ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(index)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-clash font-bold text-lg">${price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
            )}
          </div>
          <Button size="sm" className="btn-3d text-xs px-4 py-2" onClick={handleAddToCart}>
            <ShoppingBag className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
