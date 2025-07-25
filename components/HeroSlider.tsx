
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Slide, ApprovalStatus } from '../types';
import apiService from '../services/apiService';

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    apiService.fetchSlides() // This now only fetches APPROVED slides
      .then(setSlides)
      .catch(() => setError("Could not load slides."))
      .finally(() => setIsLoading(false));
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      const slideInterval = setInterval(nextSlide, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [slides.length, nextSlide]);
  
  const goToSlide = (index: number) => {
      setCurrentSlide(index);
  }

  if (isLoading) {
    return <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-300 dark:bg-slate-700 animate-pulse"></div>;
  }
  
  if (error || slides.length === 0) {
    return (
      <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">{error || "No slides to display."}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">{slide.title}</h2>
            <p className="mt-2 text-lg md:text-xl drop-shadow-md">{slide.subtitle}</p>
            <NavLink to={slide.link} className="mt-4 bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105">
              Shop Now
            </NavLink>
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
