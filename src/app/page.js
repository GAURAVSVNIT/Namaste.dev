import SplineWrapper from '../components/SplineWrapper';
import Hero from '../components/Hero';
import ScrollingCards from '../components/ScrollingCards';
import BrandCarousel from '../components/BrandCarousel';
import FeaturedVideos from '../components/FeaturedVideos';
import TestimonialsSection from '../components/TestimonialsSection';
import QuizPromo from '../components/QuizPromo';
import ServicesSection from '../components/ServicesSection';
import '../static/Hero.css';
import '../static/ScrollingCards.css';

const Home = () => {
  return (
    <>
      {/* <SplineWrapper /> */}
      <Hero />
      <ScrollingCards />
      <BrandCarousel />
      <FeaturedVideos />
      <TestimonialsSection />
      <QuizPromo />
      <ServicesSection />
    </>
  )
}

export default Home;