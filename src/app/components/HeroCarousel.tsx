import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import { CarouselSkeleton } from '@/app/components/Skeleton';

export const HeroCarousel: React.FC = () => {
  const { carouselSlides } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter to show only active slides and sort by order
  const activeSlides = carouselSlides
    .filter(slide => slide.isActive)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeSlides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlides.length]);

  // Return skeleton if no active slides (loading state)
  if (activeSlides.length === 0) {
    return <CarouselSkeleton />;
  }

  const slide = activeSlides[currentSlide];

  return (
    <div className="relative aspect-video sm:aspect-auto sm:h-[350px] md:h-[400px] overflow-hidden rounded-xl mx-4 my-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image with Link */}
          <Link to={slide.link} className="block h-full w-full">
            <img
              src={slide.image}
              alt="Carousel Slide"
              className="w-full h-full object-cover"
              loading={currentSlide === 0 ? "eager" : "lazy"}
              // @ts-ignore
              fetchpriority={currentSlide === 0 ? "high" : "auto"}
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all ${index === currentSlide
              ? 'w-8 bg-white'
              : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};