import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Star, Zap, Target, Users, CheckCircle, Rocket, Sparkles, Building } from "lucide-react";

// Custom hook to detect if an element is in the viewport
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options.triggerOnce) {
          observer.disconnect();
        }
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, inView };
};

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

// Feature highlights
const features = [
  { icon: <Zap className="w-5 h-5" />, text: "Instant Matching" },
  { icon: <CheckCircle className="w-5 h-5" />, text: "Verified Users" },
  { icon: <Star className="w-5 h-5" />, text: "5-Star Reviews" },
  { icon: <Target className="w-5 h-5" />, text: "Smart AI" },
];

const App = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.6); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.6s ease-out forwards;
          }
          .animate-slideInUp {
            animation: slideInUp 0.8s ease-out forwards;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse 3s ease-in-out infinite;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }
          .delay-700 { animation-delay: 0.7s; }
          .delay-800 { animation-delay: 0.8s; }
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          }
          .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .text-shadow {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center text-white">
          {/* Header Badge */}
          <div className={`inline-flex items-center px-6 py-3 rounded-full glass-effect font-semibold text-sm mb-8 ${inView ? 'animate-scaleIn' : 'opacity-0'}`}>
            <Rocket className="w-5 h-5 mr-2" />
            Ready to Transform Your Work?
          </div>

          {/* Main Heading */}
          <h2 className={`text-5xl md:text-7xl font-extrabold mb-6 text-shadow ${inView ? 'animate-fadeInUp' : 'opacity-0'}`}>
            Ready to Get
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Started?</span>
          </h2>
          
          {/* Subtitle */}
          <p className={`text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed ${inView ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
            Join thousands of recruiters and technicians transforming how work gets done. 
            Start your journey today and experience the future of hiring.
          </p>

          {/* Feature Highlights */}
          <div className={`flex flex-wrap justify-center gap-6 mb-12 ${inView ? 'animate-fadeInUp delay-200' : 'opacity-0'}`}>
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white/90">
                <div className="text-yellow-400">
                  {feature.icon}
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row justify-center gap-6 mb-16 ${inView ? 'animate-slideInUp delay-300' : 'opacity-0'}`}>
            <Link 
              to="/role-selection" 
              className="group relative bg-gradient-to-r from-white to-gray-100 text-blue-600 px-10 py-5 rounded-full font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 animate-glow"
            >
              <span className="flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Post a Job
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              to="/role-selection" 
              className="group glass-effect text-white px-10 py-5 rounded-full font-bold text-lg shadow-lg hover-lift"
            >
              <span className="flex items-center justify-center">
                <Target className="w-5 h-5 mr-2" />
                Browse Jobs
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Stats Section */}
          <div className={`grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 ${inView ? 'animate-fadeInUp delay-400' : 'opacity-0'}`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">24hr</div>
              <div className="text-white/80">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">15K+</div>
              <div className="text-white/80">Active Users</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className={`glass-effect rounded-3xl p-8 max-w-2xl mx-auto ${inView ? 'animate-fadeInUp delay-500' : 'opacity-0'}`}>
            <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Verified Professionals</h4>
                  <p className="text-white/70 text-sm">All users are background-checked and rated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Instant Matching</h4>
                  <p className="text-white/70 text-sm">AI-powered job and skill matching</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Top Ratings</h4>
                  <p className="text-white/70 text-sm">4.9/5 average user satisfaction</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Growing Community</h4>
                  <p className="text-white/70 text-sm">Join thousands of satisfied users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className={`mt-12 ${inView ? 'animate-fadeInUp delay-600' : 'opacity-0'}`}>
            <p className="text-white/80 mb-6 text-lg">
              Don't wait - start connecting with top talent or finding your next opportunity today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/role-selection" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 animate-pulse-slow">
                <Rocket className="w-5 h-5" />
                Get Started
              </Link>
              <button className="glass-effect text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                Watch Demo
              </button>
            </div>
            
            {/* Company Registration CTA */}
            <div className={`text-center ${inView ? 'animate-fadeInUp delay-700' : 'opacity-0'}`}>
              <p className="text-white/70 mb-4 text-base">
                Are you a company looking to scale your hiring?
              </p>
              <Link to="/company-registration" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-300">
                <Building className="w-4 h-4" />
                Register Your Company
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              

            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-float">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-20 right-20 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
            <Zap className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-20 left-20 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;
