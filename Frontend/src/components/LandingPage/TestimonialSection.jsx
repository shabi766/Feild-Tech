import React, { useState, useEffect, useRef } from "react";
import { Quote, Star } from "lucide-react";

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
    message:
      "This platform helped us find verified technicians in less than 24 hours. Simple, fast, and reliable!",
    rating: 5,
  },
  {
    name: "Ali Raza",
    role: "Freelance Technician",
    photo: "https://placehold.co/150x150/dcfce7/166534?text=AR",
    message:
      "I’ve completed over 30 jobs here. Payments are always on time, and the app is super easy to use.",
    rating: 4,
  },
  {
    name: "Sara Malik",
    role: "HR Manager at FixIt Co.",
    photo: "https://placehold.co/150x150/f0f9ff/0c4a6e?text=SM",
    message:
      "A game-changer for our hiring process. No more chasing vendors — everything is streamlined.",
    rating: 5,
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
        `}
      </style>

      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 ${inView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          What Our Users Say
        </h2>
        <p className={`text-gray-600 mb-16 max-w-2xl mx-auto text-lg ${inView ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
          Trusted by recruiters and technicians all over the country.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className={`relative bg-white p-8 rounded-2xl shadow-xl border-t-8 border-indigo-600 transform transition duration-300 hover:scale-105 hover:shadow-2xl text-left ${inView ? `animate-fadeInUp delay-${(idx + 2) * 100}` : 'opacity-0'}`}
            >
              {/* Quote Icon */}
              <Quote className="absolute -top-4 left-4 text-indigo-200 opacity-50" size={64} />
              <div className="relative z-10">
                {/* Star Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < t.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {/* Message */}
                <p className="text-gray-700 italic text-lg leading-relaxed">“{t.message}”</p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-4">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default App;
