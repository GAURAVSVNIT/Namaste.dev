"use client";
import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  const navItems = ['Explore Look', 'New In', 'Women', 'Men', 'Accessories', 'Sale'];

  return (
    <header className="sticky top-0 z-50 glass-card border-0 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-clash font-bold text-gradient">NOVA</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a 
                key={item} 
                href={item === 'Explore Look' ? '/social/look' : '#'} 
                className={`relative text-sm font-medium transition-colors duration-300 group ${
                  item === 'Explore Look' 
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent font-semibold' 
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-border/20 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a key={item} href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-300 py-2">
                  {item}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
