import React, { useState, useEffect, useRef } from "react";
import { Briefcase, UserPlus, CheckCircle, ArrowRight, Play, Pause, Zap, Target, Award, Clock, Star, Sparkles } from "lucide-react";

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

const steps = {
  recruiters: [
    {
      icon: <Briefcase size={32} className="text-white" />,
      title: "Post a Job",
      desc: "Create a detailed job post with requirements, budget, and timeline. Our AI helps optimize your listing for better visibility.",
      iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700",
      time: "2-3 minutes",
      features: ["AI-optimized descriptions", "Smart budget suggestions", "Template library"],
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <UserPlus size={32} className="text-white" />,
      title: "Review Applicants",
      desc: "Browse verified technician profiles with ratings, reviews, and detailed portfolios. Filter by skills, location, and availability.",
      iconBg: "bg-gradient-to-br from-green-600 to-emerald-700",
      time: "5-10 minutes",
      features: ["Verified profiles", "Skill matching", "Real-time availability"],
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: <CheckCircle size={32} className="text-white" />,
      title: "Assign & Track",
      desc: "Hire the perfect match and monitor job progress in real-time. Communicate seamlessly and ensure quality delivery.",
      iconBg: "bg-gradient-to-br from-purple-600 to-violet-700",
      time: "Instant",
      features: ["Real-time tracking", "Secure messaging", "Quality assurance"],
      gradient: "from-purple-500 to-violet-600"
    },
  ],
  technicians: [
    {
      icon: <Briefcase size={32} className="text-white" />,
      title: "Browse Jobs",
      desc: "Explore thousands of jobs tailored to your skills and location. Get personalized recommendations based on your profile.",
      iconBg: "bg-gradient-to-br from-orange-600 to-red-700",
      time: "1-2 minutes",
      features: ["Smart job matching", "Location-based search", "Skill filters"],
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <UserPlus size={32} className="text-white" />,
      title: "Submit Proposals",
      desc: "Send compelling proposals showcasing your expertise. Include portfolio samples and competitive pricing to stand out.",
      iconBg: "bg-gradient-to-br from-teal-600 to-cyan-700",
      time: "3-5 minutes",
      features: ["Proposal templates", "Portfolio showcase", "Competitive pricing"],
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: <CheckCircle size={32} className="text-white" />,
      title: "Get Hired & Paid",
      desc: "Accept job offers and complete work with confidence. Receive secure, on-time payments directly to your account.",
      iconBg: "bg-gradient-to-br from-pink-600 to-rose-700",
      time: "24-48 hours",
      features: ["Secure payments", "Escrow protection", "Instant transfers"],
      gradient: "from-pink-500 to-rose-600"
    },
  ],
};

// Creative morphing background shapes
const MorphingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Morphing blob shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-morph-slow"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-green-400/5 to-teal-400/5 rounded-full blur-3xl animate-morph"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 border-2 border-purple-300/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-12 h-12 bg-blue-300/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-green-300/30 transform rotate-12 animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-pink-300/15 rounded-full animate-float"></div>
    </div>
  );
};

// Floating particles system
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-particle"
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

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(progress * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, hasAnimated]);

  return <span>{count}{suffix}</span>;
};

const App = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [activeTab, setActiveTab] = useState('recruiters');

  return (
    <section ref={ref} className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32 overflow-hidden">
      {/* Creative Background Effects */}
      <MorphingBackground />
      <FloatingParticles />
      
      {/* Custom CSS for Animations */}
      <style>
        {`
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
              transform: translateY(-50vh) translateX(50px) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0px) rotate(12deg); }
            50% { transform: translateY(-15px) rotate(12deg); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
            50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
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
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-slideInUp {
            animation: slideInUp 0.8s ease-out forwards;
          }
          
          .animate-scaleIn {
            animation: scaleIn 0.6s ease-out forwards;
          }
          
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
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
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold text-sm mb-6 ${inView ? 'animate-scaleIn' : 'opacity-0'}`}>
            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
            Simple & Effective
          </div>
          
          <h2 className={`text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}>
            How It
            <span className="gradient-text"> Works</span>
          </h2>
          
          <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${inView ? 'animate-slideInUp delay-100' : 'opacity-0'}`}>
            Three simple steps to connect recruiters and technicians. Fast, secure, and efficient.
          </p>

          {/* Tab Switcher with Creative Design */}
          <div className={`flex justify-center mb-12 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-2 flex gap-2 shadow-xl border border-gray-200/50">
              <button
                onClick={() => setActiveTab('recruiters')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 relative overflow-hidden ${
                  activeTab === 'recruiters'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                For Recruiters
                {activeTab === 'recruiters' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('technicians')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 relative overflow-hidden ${
                  activeTab === 'technicians'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                For Technicians
                {activeTab === 'technicians' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-20 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {steps[activeTab].map((step, idx) => (
              <div
                key={idx}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100/50 hover-lift overflow-hidden ${inView ? `animate-slideInUp delay-${(idx + 3) * 100}` : 'opacity-0'}`}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Step Number with Creative Design */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-lg animate-glow">
                  {idx + 1}
                </div>
                
                {/* Icon Container with Creative Animation */}
                <div className={`relative p-6 rounded-2xl ${step.iconBg} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 animate-glow`}>
                  <div className="animate-spin-slow">
                    {step.icon}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                    {step.desc}
                  </p>

                  {/* Time Badge with Creative Design */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500">{step.time}</span>
                  </div>

                  {/* Features List with Enhanced Icons */}
                  <div className="space-y-3">
                    {step.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-center gap-3 group/feature">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 group-hover/feature:text-gray-800 transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow for next step with Creative Design */}
                  {idx < steps[activeTab].length - 1 && (
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats & CTA with Creative Design */}
        <div className={`text-center mt-20 ${inView ? 'animate-slideInUp delay-800' : 'opacity-0'}`}>
          <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-12 max-w-4xl mx-auto shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {inView ? <AnimatedCounter end={3} /> : "0"}
                  </div>
                  <div className="text-gray-600">Simple Steps</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-4xl font-bold gradient-text mb-2">24hr</div>
                  <div className="text-gray-600">Average Time</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {inView ? <AnimatedCounter end={98} suffix="%" /> : "0%"}
                  </div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have already transformed their hiring and job-finding experience with our platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden">
                  <span className="flex items-center justify-center relative z-10">
                    <Play className="w-5 h-5" />
                    Start Now
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-purple-600 hover:text-purple-600 transition-all duration-300 transform hover:scale-105">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;
