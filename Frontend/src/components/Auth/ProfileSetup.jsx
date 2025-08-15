import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { 
    Loader2, User, Mail, Phone, MapPin, Upload, X, Plus, AlertCircle, Camera, Save, ArrowLeft,
    Building2, Calendar, FileText, CreditCard, Shield, Briefcase, GraduationCap, Globe, 
    Heart, Camera as CameraIcon, FileImage, FileText as FileTextIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileSetup = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        // Basic Information
        fullname: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        
        // Location & Address
        location: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        
        // Professional Information
        bio: '',
        skills: [],
        experience: '',
        education: '',
        occupation: '',
        employer: '',
        monthlyIncome: '',
        
        // Identity Documents
        cnicNumber: '',
        fatherName: '',
        motherName: '',
        
        // Profile Photos
        profilePhoto: null,
        cnicFront: null,
        cnicBack: null,
        selfiePhoto: null,
        resume: null,
        
        // Emergency Contact
        emergencyContact: {
            name: '',
            relationship: '',
            phone: '',
            address: ''
        }
    });
    
    const [newSkill, setNewSkill] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState({
        profilePhoto: null,
        cnicFront: null,
        cnicBack: null,
        selfiePhoto: null
    });
    const [step, setStep] = useState(1);
    const [resumePreview, setResumePreview] = useState(null);

    useEffect(() => {
        if (user) {
            // Check if user already has a complete profile
            if (user.profileCompleted || (user.profile && user.profile.bio && user.profile.skills && user.profile.skills.length > 0)) {
                // User already has a complete profile, redirect to appropriate dashboard
                if (user.role === 'Admin') {
                    navigate('/app/administrator');
                } else if (user.role === 'Recruiter') {
                    if (user.recruiterType === 'individual' || !user.companyId) {
                        navigate('/app/recruiter/dashboard-individual');
                    } else {
                        navigate('/app/recruiter/dashboard');
                    }
                } else {
                    navigate('/app/technician/home');
                }
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                fullname: user.fullname || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                location: user.location || '',
                bio: user.bio || user.profile?.bio || '',
                skills: user.skills || user.profile?.skills || []
            }));
            
            if (user.profilePhoto) {
                setImagePreview(prev => ({ ...prev, profilePhoto: user.profilePhoto }));
            }
        }
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            if (field === 'resume') {
                setResumePreview(file.name);
                setFormData(prev => ({ ...prev, [field]: file }));
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    setImagePreview(prev => ({ ...prev, [field]: reader.result }));
                };
                reader.readAsDataURL(file);
                setFormData(prev => ({ ...prev, [field]: file }));
            }
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const validateStep = (currentStep) => {
        const newErrors = {};
        
        if (currentStep === 1) {
            if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.location) newErrors.location = 'Location is required';
        }
        
        if (currentStep === 2) {
            if (!formData.bio) newErrors.bio = 'Bio is required';
            if (!formData.occupation) newErrors.occupation = 'Occupation is required';
            if (!formData.experience) newErrors.experience = 'Experience is required';
            if (!formData.education) newErrors.education = 'Education is required';
        }
        
        if (currentStep === 3) {
            if (!formData.cnicNumber) newErrors.cnicNumber = 'CNIC number is required';
            if (!formData.fatherName) newErrors.fatherName = 'Father name is required';
            if (!formData.address) newErrors.address = 'Address is required';
            if (!formData.city) newErrors.city = 'City is required';
        }
        
        if (currentStep === 4) {
            if (!formData.emergencyContact.name) newErrors.emergencyName = 'Emergency contact name is required';
            if (!formData.emergencyContact.relationship) newErrors.emergencyRelationship = 'Relationship is required';
            if (!formData.emergencyContact.phone) newErrors.emergencyPhone = 'Emergency contact phone is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(4)) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            
            // Basic Information
            Object.keys(formData).forEach(key => {
                if (key === 'skills') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (key === 'emergencyContact') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (['profilePhoto', 'cnicFront', 'cnicBack', 'selfiePhoto', 'resume'].includes(key) && formData[key]) {
                    submitData.append(key, formData[key]);
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await axios.put(`${USER_API_END_POINT}/update-profile`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (response.data.success) {
                // Update user with profile completion flag
                const updatedUser = { ...response.data.user, profileCompleted: true };
                dispatch(setUser(updatedUser));
                toast.success('Profile updated successfully!');
                
                // Navigate to appropriate dashboard based on role
                setTimeout(() => {
                    if (user.role === 'Admin') {
                        navigate('/app/administrator');
                    } else if (user.role === 'Recruiter') {
                        if (user.recruiterType === 'individual' || !user.companyId) {
                            navigate('/app/recruiter/dashboard-individual');
                        } else {
                            navigate('/app/recruiter/dashboard');
                        }
                    } else {
                        navigate('/app/technician/home');
                    }
                }, 100);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return (
            <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        );
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    const isRecruiter = user.role === 'Recruiter';
    const isTechnician = user.role === 'Technician';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link 
                        to={user.role === 'Admin' ? '/app/administrator' : user.role === 'Recruiter' ? 
                            (user.recruiterType === 'individual' || !user.companyId ? '/app/recruiter/dashboard-individual' : '/app/recruiter/dashboard') : 
                            '/app/technician/home'}
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
                    >
                        <motion.div
                            whileHover={{ x: -3 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:text-blue-600" />
                        </motion.div>
                        Back to Dashboard
                    </Link>
                    
                    <motion.h1 
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Complete Your Profile
                    </motion.h1>
                    
                    <motion.p 
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {isRecruiter ? 'Set up your recruiter profile to start posting jobs and managing talent' : 
                         isTechnician ? 'Complete your technician profile to showcase your skills and get hired' : 
                         'Complete your profile setup to unlock all features'}
                    </motion.p>
                </motion.div>

                {/* Enhanced Step Indicator */}
                <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        {[1, 2, 3, 4].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center">
                                <motion.div 
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                                        step >= stepNumber 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                    whileHover={{ scale: step >= stepNumber ? 1.1 : 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {step >= stepNumber ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring" }}
                                        >
                                            {stepNumber}
                                        </motion.div>
                                    ) : (
                                        stepNumber
                                    )}
                                </motion.div>
                                {stepNumber < 4 && (
                                    <motion.div 
                                        className={`w-24 h-1 mx-3 transition-all duration-500 ${
                                            step > stepNumber ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                                        }`}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: step > stepNumber ? 1 : 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <motion.div 
                        className="text-center text-lg font-medium text-gray-700"
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 1 && '📝 Basic Information'}
                        {step === 2 && '💼 Professional Details'}
                        {step === 3 && '🆔 Identity & Address'}
                        {step === 4 && '📄 Documents & Verification'}
                    </motion.div>
                </motion.div>

                <motion.div 
                    className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center mb-8">
                                        <motion.div 
                                            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        >
                                            <User className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
                                        <p className="text-gray-600">Let's start with your personal details</p>
                                    </div>
                                    
                                    {/* Profile Photo */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                            <Camera className="w-5 h-5 text-blue-600" />
                                            Profile Photo
                                        </Label>
                                        <div className="relative">
                                            <motion.div 
                                                className="w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {imagePreview.profilePhoto ? (
                                                    <div className="relative w-full h-full">
                                                        <img 
                                                            src={imagePreview.profilePhoto} 
                                                            alt="Profile" 
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                        <motion.button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(prev => ({ ...prev, profilePhoto: null }));
                                                                setFormData(prev => ({ ...prev, profilePhoto: null }));
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                                                        <p className="text-sm text-gray-500 font-medium">Click to Upload Photo</p>
                                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                                                className="hidden"
                                                id="profile-photo"
                                            />
                                            <label htmlFor="profile-photo" className="absolute inset-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    {/* Basic Information Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="fullname" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="fullname"
                                                    name="fullname"
                                                    value={formData.fullname}
                                                    onChange={handleInputChange}
                                                    className={`pl-10 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 ${errors.fullname ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <ErrorMessage error={errors.fullname} />
                                        </motion.div>

                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`pl-10 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                            <ErrorMessage error={errors.email} />
                                        </motion.div>

                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    className={`pl-10 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 ${errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                            <ErrorMessage error={errors.phoneNumber} />
                                        </motion.div>

                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">Date of Birth *</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="dateOfBirth"
                                                    name="dateOfBirth"
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    className={`pl-10 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 ${errors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                                                />
                                            </div>
                                            <ErrorMessage error={errors.dateOfBirth} />
                                        </motion.div>

                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender *</Label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className={`w-full h-14 px-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-transparent transition-all duration-300 ${errors.gender ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <ErrorMessage error={errors.gender} />
                                        </motion.div>

                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location *</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="location"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="City, Country"
                                                    className={`pl-10 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                                                />
                                            </div>
                                            <ErrorMessage error={errors.location} />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        Professional Details
                                    </h3>
                                    
                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio *</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about yourself, your experience, and what makes you unique..."
                                            rows={4}
                                            className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.bio ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                        />
                                        <ErrorMessage error={errors.bio} />
                                    </div>

                                    {/* Professional Information Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">Occupation *</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="occupation"
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Software Engineer, Electrician, etc."
                                                    className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.occupation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                            </div>
                                            <ErrorMessage error={errors.occupation} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employer" className="text-sm font-medium text-gray-700">Current Employer/Company</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="employer"
                                                    name="employer"
                                                    value={formData.employer}
                                                    onChange={handleInputChange}
                                                    placeholder="Company or organization name"
                                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience *</Label>
                                            <select
                                                id="experience"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleInputChange}
                                                className={`w-full h-12 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.experience ? 'border-red-300' : 'border-gray-200'}`}
                                            >
                                                <option value="">Select Experience</option>
                                                <option value="0-1">0-1 years</option>
                                                <option value="1-3">1-3 years</option>
                                                <option value="3-5">3-5 years</option>
                                                <option value="5-10">5-10 years</option>
                                                <option value="10+">10+ years</option>
                                            </select>
                                            <ErrorMessage error={errors.experience} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="education" className="text-sm font-medium text-gray-700">Education Level *</Label>
                                            <select
                                                id="education"
                                                name="education"
                                                value={formData.education}
                                                onChange={handleInputChange}
                                                className={`w-full h-12 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.education ? 'border-red-300' : 'border-gray-200'}`}
                                            >
                                                <option value="">Select Education</option>
                                                <option value="high-school">High School</option>
                                                <option value="diploma">Diploma</option>
                                                <option value="bachelors">Bachelor's Degree</option>
                                                <option value="masters">Master's Degree</option>
                                                <option value="phd">PhD</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <ErrorMessage error={errors.education} />
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium text-gray-700">Skills & Expertise</Label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.skills.map((skill, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600 transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                placeholder="Add a skill"
                                                className="flex-1"
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            />
                                            <Button type="button" onClick={addSkill} variant="outline" className="px-4">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        Identity & Address
                                    </h3>
                                    
                                    {/* Identity Information Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cnicNumber" className="text-sm font-medium text-gray-700">CNIC Number *</Label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="cnicNumber"
                                                    name="cnicNumber"
                                                    value={formData.cnicNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="00000-0000000-0"
                                                    className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.cnicNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                            </div>
                                            <ErrorMessage error={errors.cnicNumber} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fatherName" className="text-sm font-medium text-gray-700">Father's Name *</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="fatherName"
                                                    name="fatherName"
                                                    value={formData.fatherName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter father's full name"
                                                    className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.fatherName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                            </div>
                                            <ErrorMessage error={errors.fatherName} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motherName" className="text-sm font-medium text-gray-700">Mother's Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <Input
                                                    id="motherName"
                                                    name="motherName"
                                                    value={formData.motherName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter mother's full name"
                                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Marital Status</Label>
                                            <select
                                                id="maritalStatus"
                                                name="maritalStatus"
                                                value={formData.maritalStatus}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="single">Single</option>
                                                <option value="married">Married</option>
                                                <option value="divorced">Divorced</option>
                                                <option value="widowed">Widowed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-800">Address Information</h4>
                                        
                                        <div className="grid md:grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Full Address *</Label>
                                                <Textarea
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Street address, apartment, suite, etc."
                                                    rows={3}
                                                    className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                                <ErrorMessage error={errors.address} />
                                            </div>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="City"
                                                    className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                                <ErrorMessage error={errors.city} />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Postal Code</Label>
                                                <Input
                                                    id="postalCode"
                                                    name="postalCode"
                                                    value={formData.postalCode}
                                                    onChange={handleInputChange}
                                                    placeholder="Postal code"
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    placeholder="Country"
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Documents & Verification
                                    </h3>
                                    
                                    {/* Emergency Contact */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-800">Emergency Contact</h4>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyName" className="text-sm font-medium text-gray-700">Contact Name *</Label>
                                                <Input
                                                    id="emergencyName"
                                                    name="emergencyContact.name"
                                                    value={formData.emergencyContact.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Full name of emergency contact"
                                                    className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.emergencyName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                                <ErrorMessage error={errors.emergencyName} />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyRelationship" className="text-sm font-medium text-gray-700">Relationship *</Label>
                                                <select
                                                    id="emergencyRelationship"
                                                    name="emergencyContact.relationship"
                                                    value={formData.emergencyContact.relationship}
                                                    onChange={handleInputChange}
                                                    className={`w-full h-12 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.emergencyRelationship ? 'border-red-300' : 'border-gray-200'}`}
                                                >
                                                    <option value="">Select relationship</option>
                                                    <option value="spouse">Spouse</option>
                                                    <option value="parent">Parent</option>
                                                    <option value="sibling">Sibling</option>
                                                    <option value="friend">Friend</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <ErrorMessage error={errors.emergencyRelationship} />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">Contact Phone *</Label>
                                                <Input
                                                    id="emergencyPhone"
                                                    name="emergencyContact.phone"
                                                    value={formData.emergencyContact.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Phone number"
                                                    className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.emergencyPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                                <ErrorMessage error={errors.emergencyPhone} />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyAddress" className="text-sm font-medium text-gray-700">Contact Address</Label>
                                                <Input
                                                    id="emergencyAddress"
                                                    name="emergencyContact.address"
                                                    value={formData.emergencyContact.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Address of emergency contact"
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Uploads */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-800">Document Uploads</h4>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* CNIC Front */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">CNIC Front Image</Label>
                                                <div className="relative">
                                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        {imagePreview.cnicFront ? (
                                                            <div className="relative w-full h-full">
                                                                <img 
                                                                    src={imagePreview.cnicFront} 
                                                                    alt="CNIC Front" 
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setImagePreview(prev => ({ ...prev, cnicFront: null }));
                                                                        setFormData(prev => ({ ...prev, cnicFront: null }));
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-500">Upload CNIC Front</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'cnicFront')}
                                                        className="hidden"
                                                        id="cnic-front"
                                                    />
                                                    <label htmlFor="cnic-front" className="absolute inset-0 cursor-pointer" />
                                                </div>
                                            </div>

                                            {/* CNIC Back */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">CNIC Back Image</Label>
                                                <div className="relative">
                                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        {imagePreview.cnicBack ? (
                                                            <div className="relative w-full h-full">
                                                                <img 
                                                                    src={imagePreview.cnicBack} 
                                                                    alt="CNIC Back" 
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setImagePreview(prev => ({ ...prev, cnicBack: null }));
                                                                        setFormData(prev => ({ ...prev, cnicBack: null }));
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-500">Upload CNIC Back</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'cnicBack')}
                                                        className="hidden"
                                                        id="cnic-back"
                                                    />
                                                    <label htmlFor="cnic-back" className="absolute inset-0 cursor-pointer" />
                                                </div>
                                            </div>

                                            {/* Selfie Photo */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Selfie Photo</Label>
                                                <div className="relative">
                                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        {imagePreview.selfiePhoto ? (
                                                            <div className="relative w-full h-full">
                                                                <img 
                                                                    src={imagePreview.selfiePhoto} 
                                                                    alt="Selfie" 
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setImagePreview(prev => ({ ...prev, selfiePhoto: null }));
                                                                        setFormData(prev => ({ ...prev, selfiePhoto: null }));
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <CameraIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-500">Upload Selfie</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'selfiePhoto')}
                                                        className="hidden"
                                                        id="selfie-photo"
                                                    />
                                                    <label htmlFor="selfie-photo" className="absolute inset-0 cursor-pointer" />
                                                </div>
                                            </div>

                                            {/* Resume */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Resume/CV</Label>
                                                <div className="relative">
                                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        {resumePreview ? (
                                                            <div className="text-center">
                                                                <FileTextIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-700 font-medium">{resumePreview}</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setResumePreview(null);
                                                                        setFormData(prev => ({ ...prev, resume: null }));
                                                                    }}
                                                                    className="text-red-500 text-xs hover:text-red-700 transition-colors"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <FileTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-500">Upload Resume</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => handleFileUpload(e, 'resume')}
                                                        className="hidden"
                                                        id="resume"
                                                    />
                                                    <label htmlFor="resume" className="absolute inset-0 cursor-pointer" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Enhanced Navigation Buttons */}
                        <motion.div 
                            className="flex justify-between pt-8 border-t border-gray-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 }}
                        >
                            {step > 1 && (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        variant="outline"
                                        className="px-8 py-3 h-14 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        Previous
                                    </Button>
                                </motion.div>
                            )}
                            
                            {step < 4 ? (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="ml-auto"
                                >
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-8 py-3 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        Next
                                        <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="ml-auto"
                                >
                                    <Button
                                        type="submit"
                                        className="px-8 py-3 h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Saving Profile...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-5 w-5" />
                                                Complete Profile Setup
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileSetup;
