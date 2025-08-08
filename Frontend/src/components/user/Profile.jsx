import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Contact, Mail, Pen, MapPin, Calendar, Award, Star, Download, Edit3, User, Phone, FileText, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import JobTable from '../user/JobTable';
import UpdateProfileDialog from '../user/UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '../Hooks/useGetAppliedJobs';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user, loading, error } = useSelector(store => store.auth);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (error) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-red-600 text-center">
                <p className="text-xl font-semibold">Error loading profile.</p>
                <p className="text-gray-600">Please try refreshing the page.</p>
            </div>
        </div>
    );

    const isResumeAvailable = user?.profile?.resume;

    // Calculate profile completion percentage
    const profileFields = [
        user?.fullname,
        user?.email,
        user?.phoneNumber,
        user?.profile?.bio,
        user?.profile?.skills?.length > 0,
        user?.profile?.resume
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
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

            <div className="relative z-10 py-8 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header */}
                    <motion.div 
                        ref={ref}
                        className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 mb-8 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}
                    >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                            {/* Profile Picture Section */}
                            <div className="relative">
                                <motion.div
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                                        <AvatarImage 
                                            src={user?.profile?.profilePhoto || 'https://via.placeholder.com/128x128/e0e7ff/1d4ed8?text=U'} 
                                            alt="Profile" 
                                        />
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900">{user?.fullname || 'N/A'}</h1>
                                    <motion.button
                                        onClick={() => setOpen(true)}
                                        className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                <p className="text-gray-600 text-lg mb-6 max-w-2xl">
                                    {user?.profile?.bio || 'No bio available. Add a bio to make your profile stand out!'}
                                </p>

                                {/* Profile Completion */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                                        <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div 
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-700">{user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">{user?.phoneNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Skills Section */}
                    <motion.div 
                        className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 mb-8 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {user?.profile?.skills?.length > 0 ? (
                                user.profile.skills.map((skill, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-4 py-2 text-sm font-medium">
                                            {skill}
                                        </Badge>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center w-full py-8">
                                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No skills added yet. Add your skills to improve your profile!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Resume Section */}
                    <motion.div 
                        className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 mb-8 ${inView ? 'animate-slideInUp delay-300' : 'opacity-0'}`}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Resume</h2>
                        </div>

                        {isResumeAvailable ? (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{user.profile.resumeOriginalName}</p>
                                        <p className="text-sm text-gray-600">Resume uploaded</p>
                                    </div>
                                </div>
                                <motion.a
                                    href={user.profile.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </motion.a>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No resume uploaded yet.</p>
                                <Button 
                                    onClick={() => setOpen(true)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    Upload Resume
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Applied Jobs Section */}
                    <motion.div 
                        className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 ${inView ? 'animate-slideInUp delay-400' : 'opacity-0'}`}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                        </div>
                        <JobTable />
                    </motion.div>
                </div>
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default Profile;