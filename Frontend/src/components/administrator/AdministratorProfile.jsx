import React, { useState, useEffect } from 'react';
import { User2, Shield, Mail, Phone, MapPin, Calendar, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';

const AdministratorProfile = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        fullname: user?.fullname || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
        department: user?.department || 'System Administration',
                        role: user?.role || 'Admin'
    });

    const [originalData, setOriginalData] = useState({ ...profileData });

    useEffect(() => {
        if (user) {
            const data = {
                fullname: user?.fullname || user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || '',
                bio: user?.bio || '',
                department: user?.department || 'System Administration',
                role: user?.role || 'Admin'
            };
            setProfileData(data);
            setOriginalData(data);
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Here you would typically make an API call to update the profile
            // For now, we'll simulate a successful update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOriginalData({ ...profileData });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setProfileData({ ...originalData });
        setIsEditing(false);
    };

    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <User2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{profileData.fullname}</h1>
                            <p className="text-blue-100 text-lg">{profileData.department}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Shield className="w-5 h-5" />
                                <span className="text-blue-100 font-medium">{profileData.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
                        <div className="flex gap-3">
                            {!isEditing ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading || !hasChanges}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Personal Information
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="fullname"
                                        value={profileData.fullname}
                                        onChange={(e) => handleInputChange('fullname', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={profileData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                                        Address
                                    </Label>
                                    <Input
                                        id="address"
                                        value={profileData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Professional Information
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                                        Department
                                    </Label>
                                    <Input
                                        id="department"
                                        value={profileData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                        Role
                                    </Label>
                                    <Input
                                        id="role"
                                        value={profileData.role}
                                        disabled={true}
                                        className="mt-1 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                                        Bio
                                    </Label>
                                    <textarea
                                        id="bio"
                                        value={profileData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900">Security Information</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    As a system administrator, your profile changes are logged for security purposes. 
                                    Contact the system owner for password changes and additional security settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdministratorProfile;
