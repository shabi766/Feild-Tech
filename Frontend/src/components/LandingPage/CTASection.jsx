import React, { useState, useEffect, useRef } from "react";

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

const App = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2, // Trigger when 20% of the component is visible
  });

  return (
    <section ref={ref} className="bg-gradient-to-r from-blue-600 to-indigo-700 py-24 overflow-hidden">
      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.7s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.5s ease-out forwards;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
        `}
      </style>

      <div className="container mx-auto px-6 text-center text-white">
        {/* Animated Heading */}
        <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 ${inView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          Ready to Get Started?
        </h2>
        {/* Animated Subtitle */}
        <p className={`text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto ${inView ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
          Join thousands of recruiters and technicians transforming how work gets done.
        </p>
        <div className={`flex flex-col md:flex-row justify-center gap-4 ${inView ? 'animate-scaleIn delay-200' : 'opacity-0'}`}>
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
            Post a Job
          </button>
          <button className="border-2 border-white px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105">
            Browse Jobs
          </button>
        </div>
      </div>
    </section>
  );
};

export default App;
