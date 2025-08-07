import React, { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  ShieldCheck,
  Clock,
  FileSearch,
  Wallet,
  Users,
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
    icon: <BadgeCheck className="text-white" size={24} />,
    title: "Verified Technicians",
    desc: "All workers are background-checked and rated by real clients.",
    type: "Recruiters",
    iconBg: "bg-blue-600",
  },
  {
    icon: <Clock className="text-white" size={24} />,
    title: "Faster Hiring",
    desc: "Find and hire skilled workers in minutes, not days.",
    type: "Recruiters",
    iconBg: "bg-blue-600",
  },
  {
    icon: <ShieldCheck className="text-white" size={24} />,
    title: "Secure Payments",
    desc: "Funds are released only after job completion and approval.",
    type: "Recruiters",
    iconBg: "bg-blue-600",
  },
  {
    icon: <FileSearch className="text-white" size={24} />,
    title: "Find Relevant Jobs",
    desc: "Get job matches based on your skills and availability.",
    type: "Technicians",
    iconBg: "bg-green-600",
  },
  {
    icon: <Wallet className="text-white" size={24} />,
    title: "On-time Payments",
    desc: "Receive secure payments directly to your wallet or bank.",
    type: "Technicians",
    iconBg: "bg-green-600",
  },
  {
    icon: <Users className="text-white" size={24} />,
    title: "Grow Your Reputation",
    desc: "Earn ratings and reviews to land more opportunities.",
    type: "Technicians",
    iconBg: "bg-green-600",
  },
];

const App = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2, // Trigger when 20% of the component is visible
  });

  return (
    <section ref={ref} className="bg-gray-100 py-24 overflow-hidden">
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
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }
        `}
      </style>

      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 ${inView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          Why Use Our Platform?
        </h2>
        <p className={`text-gray-600 mb-16 max-w-2xl mx-auto text-lg ${inView ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
          Built to benefit recruiters and technicians alike. Discover a smarter way to work.
        </p>

        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-10 text-left">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`bg-white p-8 rounded-2xl shadow-xl border-t-4 border-b-4 ${feature.type === 'Recruiters' ? 'border-blue-600' : 'border-green-600'} transform transition duration-300 hover:scale-105 hover:shadow-2xl ${inView ? `animate-fadeInUp delay-${(idx + 2) * 100}` : 'opacity-0'}`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${feature.iconBg} shadow-md`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-800 ml-4">{feature.title}</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              <span className={`mt-4 inline-block text-sm font-bold uppercase tracking-wide ${feature.type === 'Recruiters' ? 'text-blue-500' : 'text-green-500'}`}>
                For {feature.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default App;
