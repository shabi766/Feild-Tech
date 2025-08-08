import React, { useState, useEffect, useRef } from "react";
import { Quote, Star, ChevronLeft, ChevronRight, Play, Pause, Award, Heart, ThumbsUp, MessageCircle, Sparkles, CheckCircle } from "lucide-react";

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

const testimonials = [
  {
    name: "Ayesha Khan",
    role: "Recruiter at TechX",
    photo: "https://placehold.co/150x150/e0e7ff/1d4ed8?text=AK",
    message: "This platform helped us find verified technicians in less than 24 hours. The quality of candidates and the speed of hiring is incredible!",
    rating: 5,
    company: "TechX Solutions",
    location: "Karachi, Pakistan",
    verified: true,
    jobsCompleted: 45,
    responseTime: "2 hours",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    name: "Ahmed Hassan",
    role: "Senior Technician",
    photo: "https://placehold.co/150x150/dbeafe/1d4ed8?text=AH",
    message: "I've completed over 50 jobs through this platform. The payment system is reliable and the job matching is spot-on!",
    rating: 5,
    company: "Freelance Expert",
    location: "Lahore, Pakistan",
    verified: true,
    jobsCompleted: 52,
    responseTime: "1 hour",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    name: "Fatima Ali",
    role: "HR Manager",
    photo: "https://placehold.co/150x150/f3e8ff/9333ea?text=FA",
    message: "The verification process gives us confidence. We've hired 15 technicians and all have been excellent performers.",
    rating: 5,
    company: "InnovateCorp",
    location: "Islamabad, Pakistan",
    verified: true,
    jobsCompleted: 15,
    responseTime: "3 hours",
    gradient: "from-purple-500 to-violet-600"
  },
  {
    name: "Usman Malik",
    role: "Electrical Engineer",
    photo: "https://placehold.co/150x150/fef3c7/f59e0b?text=UM",
    message: "Great platform for finding quality work. The rating system helps build trust and the support team is always helpful.",
    rating: 5,
    company: "Tech Solutions Pro",
    location: "Faisalabad, Pakistan",
    verified: true,
    jobsCompleted: 38,
    responseTime: "4 hours",
    gradient: "from-orange-500 to-red-600"
  },
  {
    name: "Sara Ahmed",
    role: "Project Manager",
    photo: "https://placehold.co/150x150/ecfdf5/059669?text=SA",
    message: "We've streamlined our hiring process significantly. The platform's features make it easy to manage multiple projects.",
    rating: 5,
    company: "BuildRight Inc",
    location: "Rawalpindi, Pakistan",
    verified: true,
    jobsCompleted: 28,
    responseTime: "2.5 hours",
    gradient: "from-teal-500 to-cyan-600"
  },
];

// Creative morphing background shapes
const MorphingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Morphing blob shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-morph-slow"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 rounded-full blur-3xl animate-morph"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 border-2 border-pink-300/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-12 h-12 bg-indigo-300/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-yellow-300/30 transform rotate-12 animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-rose-300/15 rounded-full animate-float"></div>
    </div>
  );
};

// Floating particles system
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-particle"
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(nextTestimonial, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

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
            0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3); }
            50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.6); }
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
            background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 font-semibold text-sm mb-6 ${inView ? 'animate-scaleIn' : 'opacity-0'}`}>
            <Heart className="w-4 h-4 mr-2 animate-pulse" />
            Trusted by Thousands
          </div>
          
          <h2 className={`text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}>
            What Our Users
            <span className="gradient-text"> Say</span>
          </h2>
          
          <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${inView ? 'animate-slideInUp delay-100' : 'opacity-0'}`}>
            Real stories from recruiters and technicians who have transformed their work experience with our platform.
          </p>

          {/* Stats Row with Animated Counters */}
          <div className={`flex flex-wrap justify-center gap-8 mt-12 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold gradient-text">
                {inView ? <AnimatedCounter end={4.9} suffix="/5" /> : "0/5"}
              </div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold gradient-text">
                {inView ? <AnimatedCounter end={15} suffix="K+" /> : "0K+"}
              </div>
              <div className="text-sm text-gray-500">Happy Users</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold gradient-text">
                {inView ? <AnimatedCounter end={98} suffix="%" /> : "0%"}
              </div>
              <div className="text-sm text-gray-500">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-100/50 hover-lift ${inView ? 'animate-slideInUp delay-300' : 'opacity-0'}`}>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-sm font-semibold">
                      <Award className="w-4 h-4 mr-1" />
                      Verified User
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < testimonials[currentTestimonial].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-2xl font-medium text-gray-900 leading-relaxed">
                    "{testimonials[currentTestimonial].message}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={testimonials[currentTestimonial].photo} 
                        alt={testimonials[currentTestimonial].name} 
                        className="w-16 h-16 rounded-full object-cover border-4 border-pink-100 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</h4>
                      <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                      <p className="text-sm text-gray-500">{testimonials[currentTestimonial].company}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-bold gradient-text">{testimonials[currentTestimonial].jobsCompleted}</div>
                      <div className="text-xs text-gray-500">Jobs Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold gradient-text">{testimonials[currentTestimonial].responseTime}</div>
                      <div className="text-xs text-gray-500">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold gradient-text">{testimonials[currentTestimonial].location}</div>
                      <div className="text-xs text-gray-500">Location</div>
                    </div>
                  </div>
                </div>

                {/* Right Visual Element */}
                <div className="relative">
                  <div className={`bg-gradient-to-br ${testimonials[currentTestimonial].gradient} rounded-3xl p-8 text-white text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                    <div className="relative z-10">
                      <Quote className="w-16 h-16 mx-auto mb-6 opacity-20 animate-float" />
                      <div className="text-6xl font-bold mb-2 animate-glow">
                        {testimonials[currentTestimonial].rating}.0
                      </div>
                      <div className="text-lg opacity-90">Out of 5 Stars</div>
                      <div className="flex justify-center mt-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 text-yellow-300 fill-current animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating decorative elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-float">
                    <ThumbsUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={prevTestimonial}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-pink-600 transition-colors" />
              </button>
              <button 
                onClick={toggleAutoplay}
                className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 text-white"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button 
                onClick={nextTestimonial}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-pink-600 transition-colors" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                    index === currentTestimonial 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 scale-125 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA with Creative Design */}
        <div className={`text-center mt-20 ${inView ? 'animate-slideInUp delay-800' : 'opacity-0'}`}>
          <div className="relative bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl p-12 max-w-3xl mx-auto shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Join Our Happy Community
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience the difference that thousands of satisfied users have already discovered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden">
                  <span className="flex items-center justify-center relative z-10">
                    <Heart className="w-5 h-5" />
                    Get Started Today
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-pink-600 hover:text-pink-600 transition-all duration-300 transform hover:scale-105">
                  Read More Reviews
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
