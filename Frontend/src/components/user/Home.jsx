import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import HeroSection from '../user/HeroSection';
import CategoryCarousel from '../user/CategoryCarousel';
import LatestJobs from '../user/LatestJobs';
import Footer from '../shared/Footer';
import useGetAllJobs from '../Hooks/useGetAllJobs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, 
    MapPin, 
    Clock, 
    TrendingUp, 
    Users, 
    Star, 
    ArrowRight,
    Sparkles,
    Target,
    Award,
    Zap
} from 'lucide-react';

const Home = () => {
    useGetAllJobs();
    const { user } = useSelector(store => store.auth);
    const { allJobs = [] } = useSelector(store => store.job);
    const navigate = useNavigate();
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    useEffect(() => {
        if (user?.role === 'Recruiter') {
            navigate("/admin/companies");
        }
    }, [user, navigate]);

    // Calculate stats
    const totalJobs = allJobs.length;
    const remoteJobs = allJobs.filter(job => job.workType === 'remote').length;
    const fullTimeJobs = allJobs.filter(job => job.jobType === 'full-time').length;
    const recentJobs = allJobs.filter(job => {
        const daysAgo = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
        return daysAgo <= 7;
    }).length;

    const stats = [
        { icon: <Briefcase className="w-6 h-6" />, label: "Total Jobs", value: totalJobs, color: "from-blue-500 to-indigo-600" },
        { icon: <MapPin className="w-6 h-6" />, label: "Remote Jobs", value: remoteJobs, color: "from-green-500 to-emerald-600" },
        { icon: <Clock className="w-6 h-6" />, label: "Full-Time", value: fullTimeJobs, color: "from-purple-500 to-pink-600" },
        { icon: <TrendingUp className="w-6 h-6" />, label: "Recent Jobs", value: recentJobs, color: "from-orange-500 to-red-600" }
    ];

    const quickActions = [
        {
            title: "Browse All Jobs",
            description: "Explore thousands of opportunities",
            icon: <Briefcase className="w-8 h-8" />,
            color: "from-blue-500 to-indigo-600",
            action: () => navigate('/jobs')
        },
        {
            title: "Advanced Search",
            description: "Find jobs with specific criteria",
            icon: <Target className="w-8 h-8" />,
            color: "from-green-500 to-emerald-600",
            action: () => navigate('/browse')
        },
        {
            title: "My Applications",
            description: "Track your job applications",
            icon: <Award className="w-8 h-8" />,
            action: () => navigate('/profile')
        },
        {
            title: "Profile Setup",
            description: "Complete your professional profile",
            icon: <Users className="w-8 h-8" />,
            color: "from-purple-500 to-pink-600",
            action: () => navigate('/profile')
        }
    ];

    // Creative morphing background shapes
    const MorphingBackground = () => {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Morphing blob shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-morph-slow"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-morph"></div>

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
                {[...Array(20)].map((_, i) => (
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
            if (hasAnimated || !inView) return;

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
        }, [end, duration, hasAnimated, inView]);

        return <span>{count}{suffix}</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Creative Background Effects */}
            <MorphingBackground />
            <FloatingParticles />

            {/* Custom CSS for Animations */}
            <style>
                {`
                @keyframes morph {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                    33% { transform: translate(30px, -50px) rotate(120deg) scale(1.1); }
                    66% { transform: translate(-20px, 20px) rotate(240deg) scale(0.9); }
                }
                @keyframes morph-delayed {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                    33% { transform: translate(-30px, 50px) rotate(-120deg) scale(1.1); }
                    66% { transform: translate(20px, -20px) rotate(-240deg) scale(0.9); }
                }
                @keyframes morph-slow {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                    50% { transform: translate(20px, -30px) rotate(180deg) scale(1.05); }
                }
                @keyframes particle {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes slideInUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
                    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
                }

                .animate-morph { animation: morph 8s ease-in-out infinite; }
                .animate-morph-delayed { animation: morph-delayed 10s ease-in-out infinite; }
                .animate-morph-slow { animation: morph-slow 12s ease-in-out infinite; }
                .animate-particle { animation: particle linear infinite; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-slideInUp { animation: slideInUp 0.8s ease-out forwards; }
                .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
                .animate-glow { animation: glow 2s ease-in-out infinite; }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-600 { animation-delay: 0.6s; }
                .delay-700 { animation-delay: 0.7s; }
                .delay-800 { animation-delay: 0.8s; }

                .gradient-text {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                `}
            </style>

            <div className="relative z-10">
                {/* Hero Section */}
                <HeroSection />

                {/* Welcome Section */}
                <section ref={ref} className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Welcome Header */}
                        <div className={`text-center mb-16 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}>
                            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold text-sm mb-6">
                                <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
                                Welcome Back, {user?.fullname}!
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                Your Job Search
                                <span className="gradient-text"> Dashboard</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Discover amazing opportunities, track your applications, and take your career to the next level.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}>
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100/50 hover-lift overflow-hidden"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Gradient Background on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                    {/* Icon Container */}
                                    <div className={`relative p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300 animate-glow`}>
                                        <div className="text-white animate-spin-slow">
                                            {stat.icon}
                                        </div>
                                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    <div className="text-3xl font-bold gradient-text mb-2">
                                        {inView ? <AnimatedCounter end={stat.value} /> : "0"}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>

                                    {/* Hover Effect Border */}
                                    <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className={`mb-16 ${inView ? 'animate-slideInUp delay-400' : 'opacity-0'}`}>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                Quick Actions
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {quickActions.map((action, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100/50 hover-lift overflow-hidden cursor-pointer"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        onClick={action.action}
                                    >
                                        {/* Gradient Background on Hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color || 'from-gray-500 to-gray-600'} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                        {/* Icon Container */}
                                        <div className={`relative p-4 rounded-xl bg-gradient-to-br ${action.color || 'from-gray-500 to-gray-600'} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300 animate-glow`}>
                                            <div className="text-white animate-spin-slow">
                                                {action.icon}
                                            </div>
                                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                                        <p className="text-gray-600 mb-4">{action.description}</p>

                                        <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                                            <span>Get Started</span>
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>

                                        {/* Hover Effect Border */}
                                        <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r ${action.color || 'from-gray-500 to-gray-600'} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Featured Sections */}
                        <div className={`space-y-16 ${inView ? 'animate-slideInUp delay-600' : 'opacity-0'}`}>
                            {/* Categories */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                    Explore by Category
                                </h2>
                                <CategoryCarousel />
                            </div>

                            {/* Latest Jobs */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                    Latest Opportunities
                                </h2>
                                <LatestJobs />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default Home;