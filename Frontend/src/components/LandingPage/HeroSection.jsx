import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: '/h1.jpg',
    heading: 'Find the Right Talent or Job – Fast.',
    subheading: 'Connect with experienced technicians and recruiters in minutes. Your next opportunity is just a click away.',
    accent: 'bg-blue-600',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    image: '/h2.jpg',
    heading: 'Hire Verified Technicians Instantly',
    subheading: 'Post your job and receive applications from trusted professionals quickly and easily.',
    accent: 'bg-gray-700',
    icon: <Target className="w-6 h-6" />
  },
  {
    image: '/h3.jpg',
    heading: 'Your Next Gig is Waiting',
    subheading: 'Browse jobs tailored to your skills and get hired by top recruiters.',
    accent: 'bg-blue-600',
    icon: <Zap className="w-6 h-6" />
  },
  {
    image: '/h4.jpg',
    heading: 'Simplify Your Hiring Process',
    subheading: 'Manage applications, communicate, and assign jobs — all in one place.',
    accent: 'bg-gray-700',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    image: '/h5.jpg',
    heading: 'Grow Your Career with Us',
    subheading: 'Join a community of skilled technicians and unlock new opportunities daily.',
    accent: 'bg-blue-600',
    icon: <Target className="w-6 h-6" />
  },
];

// Creative morphing background shapes
const MorphingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Morphing blob shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-morph"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-morph-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-morph-slow"></div>
      
      {/* Geometric shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 border-2 border-white/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-12 h-12 bg-white/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-white/30 transform rotate-12 animate-bounce-slow"></div>
    </div>
  );
};

// Advanced particle system
const ParticleSystem = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 7}s`,
            animationDirection: Math.random() > 0.5 ? 'normal' : 'reverse'
          }}
        />
      ))}
      
      {/* Larger floating elements */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`large-${i}`}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float-large"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

// Text reveal animation component
const AnimatedText = ({ text, className, delay = 0 }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div 
        className="animate-text-reveal"
        style={{ animationDelay: `${delay}s` }}
      >
        {text}
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const { image, heading, subheading, accent, icon } = slides[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden font-sans">
      <style>{`
        @keyframes morph {
          0%, 100% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% { 
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(90deg) scale(1.1);
          }
          50% { 
            border-radius: 50% 60% 30% 60% / 60% 30% 60% 40%;
            transform: rotate(180deg) scale(0.9);
          }
          75% { 
            border-radius: 60% 40% 60% 30% / 30% 60% 40% 60%;
            transform: rotate(270deg) scale(1.05);
          }
        }
        
        @keyframes morph-delayed {
          0%, 100% { 
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(180deg) scale(0.9);
          }
          25% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(270deg) scale(1.1);
          }
          50% { 
            border-radius: 50% 60% 30% 60% / 60% 30% 60% 40%;
            transform: rotate(0deg) scale(1);
          }
          75% { 
            border-radius: 60% 40% 60% 30% / 30% 60% 40% 60%;
            transform: rotate(90deg) scale(1.05);
          }
        }
        
        @keyframes morph-slow {
          0%, 100% { 
            border-radius: 50% 60% 30% 60% / 60% 30% 60% 40%;
            transform: rotate(0deg) scale(1);
          }
          33% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(120deg) scale(1.1);
          }
          66% { 
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(240deg) scale(0.9);
          }
        }
        
        @keyframes particle {
          0% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(-100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes float-large {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg);
          }
          50% { 
            transform: translateY(-10px) translateX(-15px) rotate(180deg);
          }
          75% { 
            transform: translateY(-30px) translateX(5px) rotate(270deg);
          }
        }
        
        @keyframes text-reveal {
          0% { 
            transform: translateY(100%);
            opacity: 0;
          }
          100% { 
            transform: translateY(0%);
            opacity: 1;
          }
        }
        
        @keyframes slide-in-left {
          0% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          100% { 
            transform: translateX(0%);
            opacity: 1;
          }
        }
        
        @keyframes slide-in-right {
          0% { 
            transform: translateX(100%);
            opacity: 0;
          }
          100% { 
            transform: translateX(0%);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          0% { 
            transform: scale(0.8);
            opacity: 0;
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        
        .animate-morph {
          animation: morph 8s ease-in-out infinite;
        }
        
        .animate-morph-delayed {
          animation: morph-delayed 10s ease-in-out infinite;
        }
        
        .animate-morph-slow {
          animation: morph-slow 12s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle linear infinite;
        }
        
        .animate-float-large {
          animation: float-large ease-in-out infinite;
        }
        
        .animate-text-reveal {
          animation: text-reveal 1s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-105"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
      </div>

      {/* Creative Background Effects */}
      <MorphingShapes />
      <ParticleSystem />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6 sm:px-12 md:px-24 max-w-6xl mx-auto">
        {/* Accent Icon with creative animation */}
        <div className={`p-4 rounded-full ${accent} mb-6 animate-scale-in ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="animate-spin-slow">
            {icon}
          </div>
        </div>

        {/* Main Heading with text reveal */}
        <AnimatedText 
          text={heading}
          className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-shadow mb-8"
          delay={0.2}
        />
        
        {/* Subheading with staggered text reveal */}
        <AnimatedText 
          text={subheading}
          className="text-xl md:text-2xl font-medium text-gray-200 text-shadow max-w-4xl leading-relaxed"
          delay={0.4}
        />

        {/* Action Button with creative hover effect */}
        <div className={`mt-12 ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
          <Link
            to="/role-selection"
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-full font-semibold text-lg shadow-2xl transform transition-all duration-500 hover:scale-110 overflow-hidden"
          >
            <span className="flex items-center justify-center relative z-10">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          </Link>
        </div>

        {/* Quick Stats with staggered animation */}
        <div className={`flex flex-wrap justify-center gap-8 mt-16 ${isLoaded ? 'animate-slide-in-right' : 'opacity-0'}`}>
          <div className="text-center transform hover:scale-110 transition-transform duration-300">
            <div className="text-3xl font-bold gradient-text">15K+</div>
            <div className="text-sm text-gray-300">Active Technicians</div>
          </div>
          <div className="text-center transform hover:scale-110 transition-transform duration-300">
            <div className="text-3xl font-bold gradient-text">5K+</div>
            <div className="text-sm text-gray-300">Happy Clients</div>
          </div>
          <div className="text-center transform hover:scale-110 transition-transform duration-300">
            <div className="text-3xl font-bold gradient-text">98%</div>
            <div className="text-sm text-gray-300">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls with creative styling */}
      <button
        aria-label="Previous Slide"
        onClick={prevSlide}
        className="absolute top-1/2 left-6 transform -translate-y-1/2 p-4 glass-effect text-white rounded-full transition-all duration-300 hover:scale-110 z-20 hover-lift group"
      >
        <ChevronLeft size={32} className="group-hover:animate-bounce" />
      </button>
      <button
        aria-label="Next Slide"
        onClick={nextSlide}
        className="absolute top-1/2 right-6 transform -translate-y-1/2 p-4 glass-effect text-white rounded-full transition-all duration-300 hover:scale-110 z-20 hover-lift group"
      >
        <ChevronRight size={32} className="group-hover:animate-bounce" />
      </button>

      {/* Creative Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-500 transform hover:scale-125 ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-125 shadow-lg' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Creative Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center overflow-hidden">
          <div className="w-1 h-3 bg-gradient-to-b from-white to-transparent rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
