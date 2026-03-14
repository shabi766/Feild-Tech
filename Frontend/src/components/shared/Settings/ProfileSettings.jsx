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
    <div className="space-y-8 max-w-4xl animate-fade-in">
      
      {/* Profile Photo Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> Profile Photo
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Update your profile picture to help others recognize you.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 card-glass rounded-2xl">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-md">
              <AvatarImage src={previewImage} alt="Profile" className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials(profileData.fullname)}
              </AvatarFallback>
            </Avatar>
            {profilePhoto && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg"
                onClick={removeProfilePhoto}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div>
              <Label htmlFor="photo-upload" className="font-medium">Choose a new photo</Label>
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="w-full sm:max-w-[250px] cursor-pointer"
                  disabled={isUploading}
                />
                {profilePhoto && (
                  <Button
                    onClick={handlePhotoUpload}
                    disabled={isUploading}
                    className="w-full sm:w-auto"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Photo
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, at least 200x200px, max 5MB</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Personal Information */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Update your basic personal information.</p>
        </div>

        <div className="space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                name="fullname"
                value={profileData.fullname}
                onChange={handleInputChange}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleInputChange}
              className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="rounded-xl border-border bg-background focus-visible:ring-primary/20 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Brief description about yourself, your skills, or what you're looking for.</p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleProfileUpdate}
              disabled={isLoading}
              size="lg"
              className="px-8 rounded-xl shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProfileSettings;
