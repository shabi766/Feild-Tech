import React, { useState, useEffect, useRef } from "react";
import { Briefcase, UserPlus, CheckCircle } from "lucide-react";

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
      desc: "Create a job post detailing your requirements, budget, and timeline.",
      iconBg: "bg-blue-600",
      iconShadow: "shadow-blue-500/50",
    },
    {
      icon: <UserPlus size={32} className="text-white" />,
      title: "Review Applicants",
      desc: "Browse technician profiles, ratings, and proposals.",
      iconBg: "bg-blue-600",
      iconShadow: "shadow-blue-500/50",
    },
    {
      icon: <CheckCircle size={32} className="text-white" />,
      title: "Assign & Track",
      desc: "Hire the best fit and manage the job progress in real time.",
      iconBg: "bg-blue-600",
      iconShadow: "shadow-blue-500/50",
    },
  ],
  technicians: [
    {
      icon: <Briefcase size={32} className="text-white" />,
      title: "Browse Jobs",
      desc: "Explore available jobs that match your skills and location.",
      iconBg: "bg-green-600",
      iconShadow: "shadow-green-500/50",
    },
    {
      icon: <UserPlus size={32} className="text-white" />,
      title: "Submit Proposals",
      desc: "Send tailored proposals and showcase your experience.",
      iconBg: "bg-green-600",
      iconShadow: "shadow-green-500/50",
    },
    {
      icon: <CheckCircle size={32} className="text-white" />,
      title: "Get Hired & Paid",
      desc: "Accept offers, complete jobs, and receive payments securely.",
      iconBg: "bg-green-600",
      iconShadow: "shadow-green-500/50",
    },
  ],
};

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
          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.7s ease-out forwards;
          }
          .animate-fadeInRight {
            animation: fadeInRight 0.7s ease-out forwards;
          }
          .animate-fadeInLeft {
            animation: fadeInLeft 0.7s ease-out forwards;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
        `}
      </style>

      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 ${inView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          How It Works
        </h2>
        <p className={`text-gray-600 mb-16 max-w-2xl mx-auto text-lg ${inView ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
          Simple steps to connect recruiters and technicians in one powerful platform.
        </p>

        <div className="grid md:grid-cols-2 gap-12 text-left">
          {/* Recruiters */}
          <div className={`transition-all duration-500 ${inView ? 'animate-fadeInLeft delay-200' : 'opacity-0'}`}>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 mb-8">
              For Recruiters
            </h3>
            <div className="space-y-8">
              {steps.recruiters.map((step, idx) => (
                <div key={idx} className="flex items-start gap-6">
                  <div className="p-4 rounded-full bg-blue-500 shadow-md transition-shadow hover:shadow-lg">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">{step.title}</h4>
                    <p className="text-gray-600 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technicians */}
          <div className={`transition-all duration-500 ${inView ? 'animate-fadeInRight delay-200' : 'opacity-0'}`}>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500 mb-8">
              For Technicians
            </h3>
            <div className="space-y-8">
              {steps.technicians.map((step, idx) => (
                <div key={idx} className="flex items-start gap-6">
                  <div className="p-4 rounded-full bg-green-500 shadow-md transition-shadow hover:shadow-lg">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">{step.title}</h4>
                    <p className="text-gray-600 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;
