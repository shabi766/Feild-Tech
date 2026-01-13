import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullname, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { fullname, email }, { new: true });

        res.status(200).json({ success: true, message: "Profile updated", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ **Comprehensive Settings Update**
export const updateSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = {};

        // Handle different types of settings updates
        const {
            darkMode,
            language,
            currency,
            timezone,
            dateFormat,
            timeFormat,
            weekStart,
            notifications,
            privacy,
            notificationPreferences,
            profilePhoto
        } = req.body;

        // Update basic settings
        if (darkMode !== undefined) updateData.darkMode = darkMode;
        if (notifications !== undefined) updateData.notifications = notifications;

        // Update nested settings
        if (language || currency || timezone || dateFormat || timeFormat || weekStart) {
            updateData.settings = {};
            if (language) updateData.settings.language = language;
            if (currency) updateData.settings.currency = currency;
            if (timezone) updateData.settings.timezone = timezone;
            if (dateFormat) updateData.settings.dateFormat = dateFormat;
            if (timeFormat) updateData.settings.timeFormat = timeFormat;
            if (weekStart) updateData.settings.weekStart = weekStart;
        }

        // Update privacy settings
        if (privacy) {
            updateData.privacy = privacy;
        }

        // Update notification preferences
        if (notificationPreferences) {
            updateData.notificationPreferences = notificationPreferences;
        }

        // Update profile photo if provided
        if (profilePhoto) {
            updateData['profile.profilePhoto'] = profilePhoto;
        }

        // Update user with new settings
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while updating settings" 
        });
    }
};

// ✅ **Get User Settings**
export const getUserSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('+settings +privacy +notificationPreferences +darkMode +notifications +profile.profilePhoto');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const settings = {
            darkMode: user.darkMode || false,
            notifications: user.notifications !== undefined ? user.notifications : true,
            settings: user.settings || {
                language: 'en',
                currency: 'USD',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                weekStart: 'monday'
            },
            privacy: user.privacy || {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowMessages: true,
                showOnlineStatus: true,
                showLastSeen: true
            },
            notificationPreferences: user.notificationPreferences || {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                marketingEmails: false,
                jobAlerts: true,
                messageAlerts: true,
                projectUpdates: true,
                paymentNotifications: true
            },
            profilePhoto: user.profile?.profilePhoto || '/default-avatar.png'
        };

        res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        console.error("Error getting user settings:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while getting settings" 
        });
    }
};

// ✅ **Reset Settings to Defaults**
export const resetSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const defaultSettings = {
            darkMode: false,
            notifications: true,
            settings: {
                language: 'en',
                currency: 'USD',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                weekStart: 'monday'
            },
            privacy: {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowMessages: true,
                showOnlineStatus: true,
                showLastSeen: true
            },
            notificationPreferences: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                marketingEmails: false,
                jobAlerts: true,
                messageAlerts: true,
                projectUpdates: true,
                paymentNotifications: true
            }
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: defaultSettings },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Settings reset to defaults successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error resetting settings:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while resetting settings" 
        });
    }
};

// ✅ **Update Profile Photo**
export const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.user._id;
        const { profilePhoto } = req.body;

        if (!profilePhoto) {
            return res.status(400).json({ success: false, message: "Profile photo is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 'profile.profilePhoto': profilePhoto },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile photo updated successfully",
            profilePhoto: updatedUser.profile.profilePhoto
        });

    } catch (error) {
        console.error("Error updating profile photo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while updating profile photo" 
        });
    }
};
