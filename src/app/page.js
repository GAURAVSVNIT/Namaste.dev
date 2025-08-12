'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// import SplineWrapper from '../components/SplineWrapper';
import Hero from '../components/Hero';
import ScrollingCards from '../components/ScrollingCards';
import BrandCarousel from '../components/BrandCarousel';
import FeaturedVideos from '../components/FeaturedVideos';
import TestimonialsSection from '../components/TestimonialsSection';
import QuizPromo from '../components/QuizPromo';
import ServicesSection from '../components/ServicesSection';
import '../static/Hero.css';
import '../static/ScrollingCards.css';

function HomeContent() {
  const searchParams = useSearchParams();
  const scroll = searchParams.get('scroll');

  useEffect(() => {
    if (scroll === 'feedback') {
      // Wait for components to render, then scroll
      const timer = setTimeout(() => {
        const element = document.getElementById('leave-impression');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000); // Longer delay to ensure all components are rendered
      
      return () => clearTimeout(timer);
    }
  }, [scroll]);

  return (
    <div>
      {/* <SplineWrapper /> */}
      <Hero />
      <ScrollingCards />
      <BrandCarousel />
      <FeaturedVideos />
      <QuizPromo />
      <TestimonialsSection />
      <ServicesSection />
    </div>
  )
}

const Home = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

export default Home;
