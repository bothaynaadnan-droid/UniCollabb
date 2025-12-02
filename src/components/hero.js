import React, { useState, useEffect, useCallback } from 'react';

const Hero = ({ onGetStarted }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Slide data with placeholder image URLs
  const slides = [
   { id: 1,
      title: "Welcome to UniCollab",
      text: "A unified platform connecting students and supervisors across universities.",
      imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },

    {
      id: 2,
      title: "Collaborate. Innovate. Succeed.",
      text: "UniCollab connects students and supervisors across universities to share project ideas, form teams, and receive academic guidance in a unified digital environment.",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },
    
     
    {
      id: 3,
      title: "Start Your Project Easily",
      text: "Create your team, pick a supervisor, and begin your great journey.",
      imageUrl: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fselar.com%2F8001g1&psig=AOvVaw1jj6ogd3lHjP0i6eOWWv9j&ust=1764757093215000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCPj66dzWnpEDFQAAAAAdAAAAABAE",
    },
    {
      id: 4,
      title: "Upload Your Project to GitHub",
      text: "Share your code and track your progress directly through UniCollab.",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    }
  ];

  // Auto-slide functionality
  const nextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const intervalId = setInterval(nextSlide, 7000);
    return () => clearInterval(intervalId);
  }, [nextSlide]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero">
      {/* Background slides container */}
      <div className="hero-background">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide-background ${index === currentSlide ? 'active' : ''}`}
          >
            {/* Background image with overlay */}
            <div 
              className="background-image"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            />
            <div className="background-overlay"></div>
          </div>
        ))}
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="character"></div>
          
          {/* Slide content */}
          <div className="slide-content-wrapper">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide-content ${index === currentSlide ? 'active' : ''}`}
              >
                <h1>{slide.title}</h1>
                <p>{slide.text}</p>
              </div>
            ))}
          </div>
          
          <div className="get-started-container">
            <button 
              className="btn btn-primary get-started-btn eye-catch" 
              onClick={onGetStarted}
            >
              Get Started
              <div className="button-glow"></div>
              <div className="button-sparkles"></div>
            </button>
          </div>

          {/* Slide indicators */}
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;