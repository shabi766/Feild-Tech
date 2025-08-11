import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from "./HeroSection";
import TrustedSection from "./TrustedSection";
import HowItWorksSection from "./HowItWorksSection";
import FeaturesSection from "./FeaturesSection";
import CTASection from "./CTASection";
import TestimonialsSection from "./TestimonialSection";
import Footer from "../shared/Footer";
import GeneralNavbar from "../shared/Navbar/GeneralNavbar";

export default function LandingPage() {
  const [adminAccessVisible, setAdminAccessVisible] = useState(false);
  const [keySequence, setKeySequence] = useState([]);
  const navigate = useNavigate();

  // Hidden admin access via keyboard shortcut (Ctrl + Alt + A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + Alt + A combination
      if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        setAdminAccessVisible(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setAdminAccessVisible(false), 5000);
      }

      // Alternative: Konami code sequence (↑↑↓↓←→←→BA)
      const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      
      setKeySequence(prev => {
        const newSequence = [...prev, e.key];
        if (newSequence.length > konamiCode.length) {
          newSequence.shift();
        }
        
        // Check if sequence matches Konami code
        if (newSequence.length === konamiCode.length && 
            newSequence.every((key, index) => key.toLowerCase() === konamiCode[index].toLowerCase())) {
          setAdminAccessVisible(true);
          setTimeout(() => setAdminAccessVisible(false), 5000);
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminAccess = () => {
    navigate('/admin-login');
  };

  return (
    <div>
      <GeneralNavbar/>
      
      {/* Hidden Admin Access Indicator */}
      {adminAccessVisible && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🔐 Admin Access</span>
              <button
                onClick={handleAdminAccess}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                Access
              </button>
            </div>
          </div>
        </div>
      )}
      
      <HeroSection />
      <TrustedSection />
      <HowItWorksSection />
      <FeaturesSection/>
      <CTASection />
      <TestimonialsSection/>
      <Footer />
      
      {/* Hidden Admin Access Instructions (only visible in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 bg-black/80 text-white p-3 rounded-lg text-xs opacity-60 hover:opacity-100 transition-opacity">
          <div>🔐 Admin Access:</div>
          <div>• Ctrl + Alt + A</div>
          <div>• Or Konami Code</div>
        </div>
      )}
    </div>
  );
}
