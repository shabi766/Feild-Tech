import React, { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  ShieldCheck,
  Clock,
  FileSearch,
  Wallet,
  Users,
  Zap,
  TrendingUp,
  Star,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Building
} from "lucide-react";

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

const features = [
  {
    icon: <BadgeCheck className="text-white" size={28} />,
    title: "Verified Technicians",
    desc: "All workers are background-checked and rated by real clients.",
    type: "Recruiters",
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    stats: "99.8% Verified",
    highlight: "Trust & Safety",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    icon: <Clock className="text-white" size={28} />,
    title: "Faster Hiring",
    desc: "Find and hire skilled workers in minutes, not days.",
    type: "Recruiters",
    iconBg: "bg-gradient-to-br from-green-600 to-emerald-700",
    stats: "24hr Average",
    highlight: "Speed",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: <ShieldCheck className="text-white" size={28} />,
    title: "Secure Payments",
    desc: "Funds are released only after job completion and approval.",
    type: "Recruiters",
    iconBg: "bg-gradient-to-br from-purple-600 to-violet-700",
    stats: "100% Secure",
    highlight: "Protection",
    gradient: "from-purple-500 to-violet-600"
  },
  {
    icon: <Building className="text-white" size={28} />,
    title: "Company Management",
    desc: "Manage multiple clients, projects, and team collaboration.",
    type: "Company Recruiters",
    iconBg: "bg-gradient-to-br from-indigo-600 to-blue-700",
    stats: "Enterprise Ready",
    highlight: "Scale",
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    icon: <TrendingUp className="text-white" size={28} />,
    title: "Advanced Analytics",
    desc: "Track performance metrics and optimize your hiring process.",
    type: "Company Recruiters",
    iconBg: "bg-gradient-to-br from-emerald-600 to-teal-700",
    stats: "Data Driven",
    highlight: "Insights",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    icon: <FileSearch className="text-white" size={28} />,
    title: "Find Relevant Jobs",
    desc: "Get job matches based on your skills and availability.",
    type: "Technicians",
    iconBg: "bg-gradient-to-br from-orange-600 to-red-700",
    stats: "Smart Matching",
    highlight: "AI-Powered",
    gradient: "from-orange-500 to-red-600"
  },
  {
    icon: <Wallet className="text-white" size={28} />,
    title: "On-time Payments",
    desc: "Receive secure payments directly to your wallet or bank.",
    type: "Technicians",
    iconBg: "bg-gradient-to-br from-teal-600 to-cyan-700",
    stats: "Instant Transfer",
    highlight: "Reliability",
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    icon: <Users className="text-white" size={28} />,
    title: "Grow Your Reputation",
    desc: "Earn ratings and reviews to land more opportunities.",
    type: "Technicians",
    iconBg: "bg-gradient-to-br from-pink-600 to-rose-700",
    stats: "5-Star System",
    highlight: "Growth",
    gradient: "from-pink-500 to-rose-600"
  },
];

// Creative morphing background shapes
const MorphingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Morphing blob shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-morph-slow"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-400/5 to-red-400/5 rounded-full blur-3xl animate-morph"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 border-2 border-blue-300/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-12 h-12 bg-green-300/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-purple-300/30 transform rotate-12 animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-orange-300/15 rounded-full animate-float"></div>
    </div>
  );
};

// Floating particles system
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-particle"
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
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-sm mb-6 ${inView ? 'animate-scaleIn' : 'opacity-0'}`}>
            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
            Why Choose Our Platform?
          </div>
          
          <h2 className={`text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}>
            Built for
            <span className="gradient-text"> Success</span>
          </h2>
          
          <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${inView ? 'animate-slideInUp delay-100' : 'opacity-0'}`}>
            Discover a smarter way to connect recruiters and technicians. Our platform is designed to benefit both sides equally.
          </p>

          {/* Stats Row with Animated Counters */}
          <div className={`flex flex-wrap justify-center gap-8 mt-12 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold gradient-text">
                {inView ? <AnimatedCounter end={250} suffix="K+" /> : "0K+"}
              </div>
              <div className="text-sm text-gray-500">Jobs Completed</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold gradient-text">
                {inView ? <AnimatedCounter end={98} suffix="%" /> : "0%"}
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold gradient-text">24hr</div>
              <div className="text-sm text-gray-500">Average Time</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100/50 hover-lift overflow-hidden ${inView ? `animate-slideInUp delay-${(idx + 3) * 100}` : 'opacity-0'}`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Icon Container with Creative Animation */}
              <div className={`relative p-6 rounded-2xl ${feature.iconBg} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 animate-glow`}>
                <div className="animate-spin-slow">
                  {feature.icon}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                  {feature.desc}
                </p>

                {/* Stats Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.gradient} text-white shadow-md`}>
                    <Zap className="w-3 h-3 mr-1" />
                    {feature.stats}
                  </span>
                  
                  <span className={`text-sm font-semibold uppercase tracking-wide ${feature.type === 'Recruiters' ? 'text-blue-600' : 'text-green-600'}`}>
                    For {feature.type}
                  </span>
                </div>

                {/* Highlight Badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    <Award className="w-3 h-3 mr-1" />
                    {feature.highlight}
                  </span>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA with Creative Design */}
        <div className={`text-center mt-16 ${inView ? 'animate-slideInUp delay-800' : 'opacity-0'}`}>
          <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 max-w-3xl mx-auto border border-gray-200/50 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Experience the Difference?
              </h3>
              <p className="text-gray-600 mb-8">
                Join thousands of satisfied users who have transformed their hiring and job-finding experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 overflow-hidden">
                  <span className="flex items-center justify-center relative z-10">
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                  Learn More
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
