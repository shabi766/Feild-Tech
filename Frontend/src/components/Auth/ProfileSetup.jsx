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
import { Loader2, User, Mail, Phone, MapPin, Upload, X, Plus, AlertCircle, Camera, Save, ArrowLeft } from 'lucide-react';

const ProfileSetup = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        location: '',
        bio: '',
        skills: [],
        profilePhoto: null
    });
    
    const [newSkill, setNewSkill] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullname: user.fullname || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                location: user.location || '',
                bio: user.bio || '',
                skills: user.skills || []
            }));
            
            if (user.profilePhoto) {
                setImagePreview(user.profilePhoto);
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setFormData(prev => ({ ...prev, profilePhoto: file }));
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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.bio) newErrors.bio = 'Bio is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'skills') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (key === 'profilePhoto' && formData[key]) {
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
                dispatch(setUser(response.data.user));
                toast.success('Profile updated successfully!');
                
                // Add a small delay to ensure state is properly set
                setTimeout(() => {
                    navigate(user.role === 'Admin' ? '/app/administrator' : user.role === 'Recruiter' ? '/app/dashboard' : '/app/home');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <Link 
                        to={user.role === 'Admin' ? '/app/administrator' : user.role === 'Recruiter' ? '/app/dashboard' : '/app/home'}
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-gray-600">Add your details to make your profile stand out</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Photo */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Profile Photo</Label>
                            <div className="relative">
                                <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={imagePreview} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData(prev => ({ ...prev, profilePhoto: null }));
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Upload Photo</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="profile-photo"
                                />
                                <label htmlFor="profile-photo" className="absolute inset-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="fullname"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.fullname ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                </div>
                                <ErrorMessage error={errors.fullname} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                </div>
                                <ErrorMessage error={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                </div>
                                <ErrorMessage error={errors.phoneNumber} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="City, Country"
                                        className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                </div>
                                <ErrorMessage error={errors.location} />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio *</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.bio ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            <ErrorMessage error={errors.bio} />
                        </div>

                        {/* Skills */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">Skills</Label>
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

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Save Profile
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
