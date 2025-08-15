import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Contact, Mail, Pen, MapPin, Calendar, Award, Star, Download, Edit3, User, Phone, FileText, Sparkles, CheckCircle, TrendingUp, Briefcase, Users, Building2, Plus, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';
import JobTable from '../user/JobTable';
import UpdateProfileDialog from '../user/UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '../Hooks/useGetAppliedJobs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/Hooks/useTranslation';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user, loading, error } = useSelector(store => store.auth);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (error) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-red-600 text-center">
                <p className="text-xl font-semibold">{t('errorLoadingProfile')}</p>
                <p className="text-gray-600">{t('pleaseTryRefreshing')}</p>
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
                    {/* Enhanced Profile Header */}
                    <motion.div 
                        ref={ref}
                        className={`bg-gradient-to-br from-white/95 to-blue-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 mb-8 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}
                    >
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                            {/* Enhanced Profile Photo */}
                            <motion.div 
                                className="relative group"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                                    {user?.profilePhoto ? (
                                        <img 
                                            src={user.profilePhoto} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                            <User className="w-16 h-16 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Role Badge */}
                                <motion.div 
                                    className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    style={{
                                        background: user?.role === 'Recruiter' 
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : user?.role === 'Admin'
                                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                                    }}
                                >
                                    {user?.role}
                                </motion.div>
                            </motion.div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center lg:text-left">
                                <motion.div 
                                    className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div>
                                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                            {user?.fullname || t('completeYourProfile')}
                                        </h1>
                                        <p className="text-gray-600 text-lg mb-4 max-w-2xl">
                                            {user?.profile?.bio || 
                                                (user?.role === 'Recruiter' 
                                                    ? t('setUpRecruiterProfile')
                                                    : user?.role === 'Technician'
                                                    ? t('completeTechnicianProfile')
                                                    : t('addBioToStandOut')
                                                )
                                            }
                                        </p>
                                    </div>
                                    
                                    <motion.button
                                        onClick={() => navigate(`/app/${user?.role === 'Admin' ? 'administrator' : user?.role === 'Recruiter' ? 'recruiter' : 'technician'}/profile/update`)}
                                        className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Edit3 className="w-6 h-6" />
                                    </motion.button>
                                </motion.div>

                                {/* Enhanced Profile Completion */}
                                <motion.div 
                                    className="mb-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700">{t('profileCompletion')}</span>
                                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            {completionPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercentage}%` }}
                                            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center lg:text-left">
                                        {completionPercentage < 50 ? t('keepGoingCompleteProfile') :
                                         completionPercentage < 100 ? t('almostThereCompleteProfile') :
                                         t('perfectProfileComplete')}
                                    </p>
                                </motion.div>

                                {/* Enhanced Contact Info */}
                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <motion.div 
                                        className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Mail className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-gray-500 font-medium">{t('email')}</p>
                                            <p className="text-gray-700 font-semibold">{user?.email || t('notProvided')}</p>
                                        </div>
                                    </motion.div>
                                    
                                    <motion.div 
                                        className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <Phone className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-gray-500 font-medium">{t('phone')}</p>
                                            <p className="text-gray-700 font-semibold">{user?.phoneNumber || t('notProvided')}</p>
                                        </div>
                                    </motion.div>
                                </motion.div>
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
                            <h2 className="text-2xl font-bold text-gray-900">{t('skillsAndExpertise')}</h2>
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
                                    <p className="text-gray-500">{t('noSkillsAddedYet')}</p>
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
                            <h2 className="text-2xl font-bold text-gray-900">{t('resume')}</h2>
                        </div>

                        {isResumeAvailable ? (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{user.profile.resumeOriginalName}</p>
                                        <p className="text-sm text-gray-600">{t('resumeUploaded')}</p>
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
                                    {t('download')}
                                </motion.a>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">{t('noResumeUploadedYet')}</p>
                                <Button 
                                    onClick={() => setOpen(true)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    {t('uploadResume')}
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Applied Jobs Section - Only for Technicians */}
                    {user?.role === 'Technician' && (
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
                    )}

                    {/* Recruiter Dashboard Stats - Only for Recruiters */}
                    {user?.role === 'Recruiter' && (
                        <motion.div 
                            className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 ${inView ? 'animate-slideInUp delay-400' : 'opacity-0'}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h2>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <motion.div 
                                    className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Posted Jobs</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">0</p>
                                    <p className="text-sm text-gray-600">Active job postings</p>
                                </motion.div>

                                <motion.div 
                                    className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Applicants</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">0</p>
                                    <p className="text-sm text-gray-600">Total applications</p>
                                </motion.div>

                                <motion.div 
                                    className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-purple-500 rounded-lg">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Companies</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-purple-600">0</p>
                                    <p className="text-sm text-gray-600">Managed companies</p>
                                </motion.div>
                            </div>

                            <div className="mt-6 text-center">
                                <Button 
                                    onClick={() => navigate('/app/recruiter/jobs/create')}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Post New Job
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Admin Dashboard Stats - Only for Admins */}
                    {user?.role === 'Admin' && (
                        <motion.div 
                            className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 ${inView ? 'animate-slideInUp delay-400' : 'opacity-0'}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <motion.div 
                                    className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-red-500 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Total Users</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-red-600">0</p>
                                    <p className="text-sm text-gray-600">Registered users</p>
                                </motion.div>

                                <motion.div 
                                    className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Companies</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">0</p>
                                    <p className="text-sm text-gray-600">Registered companies</p>
                                </motion.div>

                                <motion.div 
                                    className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Active Jobs</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">0</p>
                                    <p className="text-sm text-gray-600">Open positions</p>
                                </motion.div>
                            </div>

                            <div className="mt-6 text-center">
                                <Button 
                                    onClick={() => navigate('/app/administrator')}
                                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold"
                                >
                                    <Shield className="w-5 h-5 mr-2" />
                                    Access Admin Panel
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default Profile;