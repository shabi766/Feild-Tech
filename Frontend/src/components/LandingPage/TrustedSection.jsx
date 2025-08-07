import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

const stats = [
  { label: "Jobs Completed", value: "250K+" },
  { label: "Trusted Clients", value: "5,000+" },
  { label: "Success Rate", value: "98%" },
  { label: "Skilled Technicians", value: "15,000+" },
];

const App = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2, // Trigger when 20% of the component is visible
  });

  return (
    <section ref={ref} className="bg-gray-900 py-24 overflow-hidden">
      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.7s ease-out forwards;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
        `}
      </style>

      <div className="container mx-auto px-6 text-center">
        {/* Animated Heading */}
        <h2 className={`text-3xl md:text-5xl font-extrabold text-white mb-4 ${inView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          Trusted by Thousands
        </h2>
        {/* Animated Subtitle */}
        <p className={`text-gray-400 mb-12 max-w-2xl mx-auto text-lg md:text-xl ${inView ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
          Join a network where work gets done fast and right. We empower businesses and skilled workers to connect efficiently.
        </p>

        {/* Animated Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center bg-gray-800 p-8 rounded-2xl shadow-lg transition duration-300 hover:shadow-xl hover:scale-105 transform ${inView ? `animate-fadeInUp delay-${(idx + 2) * 100}` : 'opacity-0'}`}
            >
              <h3 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                {stat.value}
              </h3>
              <p className="text-gray-300 mt-2 font-medium text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default App;
