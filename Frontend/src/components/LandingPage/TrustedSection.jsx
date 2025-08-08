import React, { useState, useEffect, useRef } from "react";
import { Shield, Award, CheckCircle, Star, Users, Zap, Target, Sparkles, Heart, ThumbsUp, MessageCircle } from "lucide-react";

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

const trustFactors = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Verified Profiles",
    desc: "Every technician undergoes thorough background verification and skill assessment.",
    stats: "99.8% Verified",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-100 to-indigo-100"
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Quality Guarantee",
    desc: "We ensure high-quality work with our satisfaction guarantee and dispute resolution.",
    stats: "98% Satisfaction",
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-100 to-emerald-100"
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: "Secure Payments",
    desc: "Your funds are protected with escrow and released only after job completion.",
    stats: "100% Secure",
    gradient: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-100 to-violet-100"
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "24/7 Support",
    desc: "Round-the-clock customer support to help you with any questions or issues.",
    stats: "24/7 Available",
    gradient: "from-orange-500 to-red-600",
    bgGradient: "from-orange-100 to-red-100"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community Trust",
    desc: "Join thousands of satisfied users who trust our platform for their hiring needs.",
    stats: "15K+ Users",
    gradient: "from-teal-500 to-cyan-600",
    bgGradient: "from-teal-100 to-cyan-100"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Fast Matching",
    desc: "AI-powered matching system connects you with the right talent in minutes.",
    stats: "5 Min Average",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-100 to-rose-100"
  },
];

const stats = [
  { number: "15K+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
  { number: "50K+", label: "Jobs Completed", icon: <CheckCircle className="w-6 h-6" /> },
  { number: "98%", label: "Success Rate", icon: <Star className="w-6 h-6" /> },
  { number: "24hr", label: "Avg Response", icon: <Zap className="w-6 h-6" /> },
];

// Creative morphing background shapes
const MorphingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Morphing blob shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-morph-slow"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-pink-400/5 to-rose-400/5 rounded-full blur-3xl animate-morph"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 border-2 border-indigo-300/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-12 h-12 bg-green-300/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-pink-300/30 transform rotate-12 animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-purple-300/15 rounded-full animate-float"></div>
    </div>
  );
};

// Floating particles system
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-particle"
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
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
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
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-semibold text-sm mb-6 ${inView ? 'animate-scaleIn' : 'opacity-0'}`}>
            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
            Trust & Security
          </div>
          
          <h2 className={`text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}>
            Why Users
            <span className="gradient-text"> Trust Us</span>
          </h2>
          
          <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${inView ? 'animate-slideInUp delay-100' : 'opacity-0'}`}>
            We've built our platform on the foundation of trust, security, and reliability. Here's what makes us different.
          </p>

          {/* Stats Row with Animated Counters */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}>
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl mb-4 animate-glow">
                  <div className="text-indigo-600 animate-spin-slow">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">
                  {inView ? <AnimatedCounter end={parseInt(stat.number)} suffix={stat.number.includes('+') ? '+' : stat.number.includes('%') ? '%' : ''} /> : "0"}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Factors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {trustFactors.map((factor, idx) => (
            <div
              key={idx}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100/50 hover-lift overflow-hidden ${inView ? `animate-slideInUp delay-${(idx + 3) * 100}` : 'opacity-0'}`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${factor.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              {/* Icon Container with Creative Animation */}
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${factor.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 animate-glow`}>
                <div className="text-white animate-spin-slow">
                  {factor.icon}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {factor.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                  {factor.desc}
                </p>

                {/* Stats Badge with Creative Design */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${factor.gradient} text-white text-sm font-semibold shadow-md`}>
                  <Target className="w-4 h-4 mr-2" />
                  {factor.stats}
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r ${factor.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators Section */}
        <div className={`text-center ${inView ? 'animate-slideInUp delay-800' : 'opacity-0'}`}>
          <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-12 max-w-4xl mx-auto shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Trusted by Industry Leaders
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">ISO 27001</div>
                  <div className="text-sm text-gray-500">Certified</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">GDPR</div>
                  <div className="text-sm text-gray-500">Compliant</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">SSL</div>
                  <div className="text-sm text-gray-500">Encrypted</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Our commitment to security and trust has earned us certifications and recognition from leading industry standards.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden">
                  <span className="flex items-center justify-center relative z-10">
                    <Shield className="w-5 h-5" />
                    Learn More
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 transform hover:scale-105">
                  Security Report
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
