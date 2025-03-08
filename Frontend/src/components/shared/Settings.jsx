import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings, deleteAccount } from "@/redux/userSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { USER_API_END_POINT } from "@/components/utils/constant";
import { Switch } from "../ui/switch";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [settings, setSettings] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    password: "",
    notifications: user?.notifications || false,
    darkMode: user?.darkMode || false,
    profilePhoto: null,
    certifications: user?.certifications || [],
    courses: user?.courses || [],
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const [previewImage, setPreviewImage] = useState(
    user?.profile?.profilePhoto || "/default-avatar.png"
  );
  const [openSection, setOpenSection] = useState(null); // Used to control which section is open

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings({ ...settings, profilePhoto: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("fullname", settings.fullname);
      formData.append("email", settings.email);
      if (settings.password) formData.append("password", settings.password);
      formData.append("notifications", settings.notifications);
      formData.append("darkMode", settings.darkMode);
      if (settings.profilePhoto) formData.append("profilePhoto", settings.profilePhoto);
      formData.append("certifications", JSON.stringify(settings.certifications));
      formData.append("courses", JSON.stringify(settings.courses));
      formData.append("bio", settings.bio);
      formData.append("location", settings.location);

      await axios.put(`${USER_API_END_POINT}/update-settings`, formData, {
        withCredentials: true,
      });

      dispatch(updateUserSettings(settings));
      toast.success("Settings updated successfully!");
      setOpenSection(null); // Close the section after submit
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating settings.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm("Are you sure you want to delete your account? This action is irreversible!")
    )
      return;

    try {
      await axios.delete(`${USER_API_END_POINT}/delete-account`, {
        withCredentials: true,
      });
      dispatch(deleteAccount());
      toast.success("Account deleted successfully!");
    } catch (error) {
      toast.error("Error deleting account.");
    }
  };

  const handleAddCertification = () => {
    setSettings({ ...settings, certifications: [...settings.certifications, ""] });
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = [...settings.certifications];
    updatedCertifications.splice(index, 1);
    setSettings({ ...settings, certifications: updatedCertifications });
  };

  const handleCertificationChange = (e, index) => {
    const updatedCertifications = [...settings.certifications];
    updatedCertifications[index] = e.target.value;
    setSettings({ ...settings, certifications: updatedCertifications });
  };

  const handleAddCourse = () => {
    setSettings({ ...settings, courses: [...settings.courses, ""] });
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = [...settings.courses];
    updatedCourses.splice(index, 1);
    setSettings({ ...settings, courses: updatedCourses });
  };

  const handleCourseChange = (e, index) => {
    const updatedCourses = [...settings.courses];
    updatedCourses[index] = e.target.value;
    setSettings({ ...settings, courses: updatedCourses });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

      {/* Section Navigation */}
      <div className="space-y-2">
        <Button onClick={() => toggleSection("profile")} className="w-full">
          Profile Information
        </Button>
        {openSection === "profile" && (
          <div className="mt-2 p-4 border rounded-md">
            <h3 className="text-xl font-semibold mb-3">Profile Information</h3>
            <p className="text-gray-600 mb-4">
              Manage your profile picture. A profile picture helps others recognize you.
            </p>
            <div className="flex items-center space-x-4">
              <img
                src={previewImage}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="border p-2 rounded-md"
              />
            </div>
          </div>
        )}

        <Button onClick={() => toggleSection("account")} className="w-full">
          Account Details
        </Button>
        {openSection === "account" && (
          <div className="mt-2 p-4 border rounded-md">
            <h3 className="text-xl font-semibold mb-3">Account Details</h3>
            <p className="text-gray-600 mb-4">
              Update your account information, including your full name, email, and password.
            </p>
            <form onSubmit={handleSubmit}>
              {/* Account Form Fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={settings.fullname}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  New Password (Leave empty to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={settings.password}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
              <Button type="submit">Save Account Details</Button>
            </form>
          </div>
        )}

        <Button onClick={() => toggleSection("preferences")} className="w-full">
          Preferences
        </Button>
        {openSection === "preferences" && (
          <div className="mt-2 p-4 border rounded-md">
            <h3 className="text-xl font-semibold mb-3">Preferences</h3>
            <p className="text-gray-600 mb-4">
              Customize your experience by managing your preferences, such as dark mode and notifications.
            </p>
            <form onSubmit={handleSubmit}>
              {/* Preferences Form Fields */}
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifications: checked })
                  }
                />
              </div>
              <Button type="submit">Save Preferences</Button>
            </form>
          </div>
        )}

        <Button onClick={() => toggleSection("additional")} className="w-full">
          Additional Information
        </Button>
        {openSection === "additional" && (
          <div className="mt-2 p-4 border rounded-md">
            <h3 className="text-xl font-semibold mb-3">Additional Information</h3>
            <p className="text-gray-600 mb-4">
              Add or update your certifications, courses, bio, and location.
            </p>
            <form onSubmit={handleSubmit}>
              {/* Additional Information Form Fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Certifications</label>
                {settings.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => handleCertificationChange(e, index)}
                      className="mt-1 block w-full p-2 border rounded-md"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="ml-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={handleAddCertification}>
                  Add Certification
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Courses</label>
                {settings.courses.map((course, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => handleCourseChange(e, index)}
                      className="mt-1 block w-full p-2 border rounded-md"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveCourse(index)}
                      className="ml-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={handleAddCourse}>
                  Add Course
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={settings.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={settings.location}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>

              <Button type="submit">Save Additional Information</Button>
            </form>
          </div>
        )}

        <Button onClick={handleDeleteAccount} className="w-full bg-red-500 hover:bg-red-600 text-white">
          Delete Account
        </Button>
      </div>
    </div>
  );
};

export default Settings;