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
import { useTranslation } from '@/Hooks/useTranslation';
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
    Zap,
    Search
} from 'lucide-react';

const Home = () => {
    useGetAllJobs();
    const { user } = useSelector(store => store.auth);
    const { allJobs = [] } = useSelector(store => store.job);
    const navigate = useNavigate();
    const { t } = useTranslation();
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
        { icon: <Briefcase className="w-6 h-6" />, label: t('totalJobs'), value: totalJobs, color: "from-primary to-primary-dark" },
        { icon: <MapPin className="w-6 h-6" />, label: t('remoteJobs'), value: remoteJobs, color: "from-green-500 to-emerald-600" },
        { icon: <Clock className="w-6 h-6" />, label: t('fullTime'), value: fullTimeJobs, color: "from-primary to-primary-light" },
        { icon: <TrendingUp className="w-6 h-6" />, label: t('recentJobs'), value: recentJobs, color: "from-orange-500 to-red-600" }
    ];

    const quickActions = [
        {
            title: t('browseJobs'),
            description: t('findNextOpportunity'),
            icon: <Search className="w-8 h-8" />,
            color: "from-green-500 to-emerald-600",
            action: () => navigate('/app/technician/browse')
        },
        {
            title: t('myApplications'),
            description: t('trackJobApplications'),
            icon: <Award className="w-8 h-8" />,
            action: () => navigate('/app/technician/profile')
        },
        {
            title: t('profileSetup'),
            description: t('completeProfessionalProfile'),
            icon: <Users className="w-8 h-8" />,
            color: "from-primary to-primary-light",
            action: () => navigate('/app/technician/profile')
        }
    ];

    // Creative morphing background shapes
    const MorphingBackground = () => {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Morphing blob shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-morph-slow"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-full blur-3xl animate-morph"></div>

                {/* Floating geometric shapes */}
                <div className="absolute top-20 right-20 w-16 h-16 border-2 border-blue-300/20 rotate-45 animate-spin-slow"></div>
                <div className="absolute bottom-32 left-32 w-12 h-12 bg-green-300/10 rounded-full animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-primary/30 transform rotate-12 animate-bounce-slow"></div>
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
                        className="absolute w-1 h-1 bg-gradient-to-r from-primary-light to-primary rounded-full animate-particle"
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
        <div className="flex-1 w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Creative Background Effects */}
            <MorphingBackground />
            <FloatingParticles />



            <div className="relative z-10">
                {/* Hero Section */}
                <HeroSection />

                {/* Welcome Section */}
                <section ref={ref} className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Welcome Header */}
                        <div className={`text-center mb-16 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}>
                            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold text-sm mb-6">
                                <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
                                {t('welcomeBack')}, {user?.fullname}!
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                {t('yourJobSearch')}
                                <span className="gradient-text"> {t('dashboard')}</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                {t('discoverAmazingDesc')}
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
                                {t('quickActions')}
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
                                            <span>{t('getStarted')}</span>
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
                                    {t('exploreByCategory')}
                                </h2>
                                <CategoryCarousel />
                            </div>

                            {/* Latest Jobs */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                    {t('latestOpportunities')}
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