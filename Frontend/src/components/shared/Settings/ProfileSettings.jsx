import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Save,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';

const ProfileSettings = ({ user, settings, updateSetting, isLoading, setSaveStatus }) => {
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile?.profilePhoto || '/default-avatar.png');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Profile photo must be less than 5MB');
        return;
      }
      
      setProfilePhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setPreviewImage(user?.profile?.profilePhoto || '/default-avatar.png');
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', profilePhoto);

      const response = await axios.put(`${USER_API_END_POINT}/update-profile-photo`, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Profile photo updated successfully!');
        setSaveStatus({ type: 'success', message: 'Profile photo updated successfully!' });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      toast.error('Failed to update profile photo');
      setSaveStatus({ type: 'error', message: 'Failed to update profile photo' });
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.put(`${USER_API_END_POINT}/update-profile`, profileData, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      toast.error('Failed to update profile');
      setSaveStatus({ type: 'error', message: 'Failed to update profile' });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            Profile Photo
          </CardTitle>
          <CardDescription>
            Update your profile picture to help others recognize you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                <AvatarImage src={previewImage} alt="Profile" />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  {getInitials(profileData.fullname)}
                </AvatarFallback>
              </Avatar>
              {profilePhoto && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  onClick={removeProfilePhoto}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="photo-upload" className="text-sm font-medium">
                  Choose a new photo
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  {profilePhoto && (
                    <Button
                      onClick={handlePhotoUpload}
                      disabled={isUploading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 200x200 pixels, max 5MB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your basic personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name
              </Label>
              <Input
                id="fullname"
                name="fullname"
                value={profileData.fullname}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                placeholder="Enter your location"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              Website
            </Label>
            <Input
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleInputChange}
              placeholder="Enter your website URL"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Brief description about yourself, your skills, or what you're looking for
            </p>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handleProfileUpdate}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Profile Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            Current Profile Status
          </CardTitle>
          <CardDescription>
            Overview of your current profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Profile Completion</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (Object.values(profileData).filter(Boolean).length / Object.keys(profileData).length) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round((Object.values(profileData).filter(Boolean).length / Object.keys(profileData).length) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Profile Visibility</Label>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {settings.privacy?.profileVisibility || 'Public'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
