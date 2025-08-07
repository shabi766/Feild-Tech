import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: '/h1.jpg',
    heading: 'Find the Right Talent or Job – Fast.',
    subheading: 'Connect with experienced technicians and recruiters in minutes. Your next opportunity is just a click away.'
  },
  {
    image: '/h2.jpg',
    heading: 'Hire Verified Technicians Instantly',
    subheading: 'Post your job and receive applications from trusted professionals quickly and easily.'
  },
  {
    image: '/h3.jpg',
    heading: 'Your Next Gig is Waiting',
    subheading: 'Browse jobs tailored to your skills and get hired by top recruiters.'
  },
  {
    image: '/h4.jpg',
    heading: 'Simplify Your Hiring Process',
    subheading: 'Manage applications, communicate, and assign jobs — all in one place.'
  },
  {
    image: '/h5.jpg',
    heading: 'Grow Your Career with Us',
    subheading: 'Join a community of skilled technicians and unlock new opportunities daily.'
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const { image, heading, subheading } = slides[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden font-sans">
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.7s ease-out forwards;
          animation-delay: 0.1s;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
          animation-delay: 0.3s;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
          animation-delay: 0.5s;
        }
      `}</style>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-in-out scale-105"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6 sm:px-12 md:px-24 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight animate-fade-in-down drop-shadow-lg">
          {heading}
        </h1>
        <p className="mt-6 text-lg md:text-xl font-medium text-gray-100 animate-fade-in-up drop-shadow-md max-w-3xl">
          {subheading}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mt-10 animate-scale-in">
          <Link
            to="/signup"
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg transform transition duration-300 hover:scale-105"
          >
            Get Started
          </Link>
          <a
            href="#how-it-works"
            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-white hover:text-teal-500 transition duration-300 transform hover:scale-105"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Controls */}
      <button
        aria-label="Previous Slide"
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full transition hover:bg-black/70 z-20"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        aria-label="Next Slide"
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full transition hover:bg-black/70 z-20"
      >
        <ChevronRight size={28} />
      </button>
    </section>
  );
};

export default HeroSection;
