import { User } from "../Models/user.model.js";
import { uploadToS3 } from "../utils/s3Upload.js";

/**
 * Comprehensive Settings Update
 */
export const updateSettings = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
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
            profilePhoto,
            // Individual privacy fields (if flattened)
            profileVisibility,
            showEmail,
            showPhone,
            allowMessages,
            showOnlineStatus,
            showLastSeen,
            // Individual notification fields (if flattened)
            emailNotifications,
            pushNotifications,
            smsNotifications,
            marketingEmails,
            jobAlerts,
            messageAlerts,
            projectUpdates,
            paymentNotifications
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
        if (privacy || profileVisibility || showEmail !== undefined || showPhone !== undefined || 
            allowMessages !== undefined || showOnlineStatus !== undefined || showLastSeen !== undefined) {
            
            updateData.privacy = privacy || {};
            if (profileVisibility) updateData.privacy.profileVisibility = profileVisibility;
            if (showEmail !== undefined) updateData.privacy.showEmail = showEmail;
            if (showPhone !== undefined) updateData.privacy.showPhone = showPhone;
            if (allowMessages !== undefined) updateData.privacy.allowMessages = allowMessages;
            if (showOnlineStatus !== undefined) updateData.privacy.showOnlineStatus = showOnlineStatus;
            if (showLastSeen !== undefined) updateData.privacy.showLastSeen = showLastSeen;
        }

        // Update notification preferences
        if (notificationPreferences || emailNotifications !== undefined || pushNotifications !== undefined || 
            smsNotifications !== undefined || marketingEmails !== undefined || jobAlerts !== undefined || 
            messageAlerts !== undefined || projectUpdates !== undefined || paymentNotifications !== undefined) {
            
            updateData.notificationPreferences = notificationPreferences || {};
            if (emailNotifications !== undefined) updateData.notificationPreferences.emailNotifications = emailNotifications;
            if (pushNotifications !== undefined) updateData.notificationPreferences.pushNotifications = pushNotifications;
            if (smsNotifications !== undefined) updateData.notificationPreferences.smsNotifications = smsNotifications;
            if (marketingEmails !== undefined) updateData.notificationPreferences.marketingEmails = marketingEmails;
            if (jobAlerts !== undefined) updateData.notificationPreferences.jobAlerts = jobAlerts;
            if (messageAlerts !== undefined) updateData.notificationPreferences.messageAlerts = messageAlerts;
            if (projectUpdates !== undefined) updateData.notificationPreferences.projectUpdates = projectUpdates;
            if (paymentNotifications !== undefined) updateData.notificationPreferences.paymentNotifications = paymentNotifications;
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
        ).select('-password');

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
            message: "Server error while updating settings",
            error: error.message
        });
    }
};

/**
 * Get User Settings
 */
export const getUserSettings = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
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
            message: "Server error while getting settings",
            error: error.message
        });
    }
};

/**
 * Reset Settings to Defaults
 */
export const resetSettings = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        
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
        ).select('-password');

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
            message: "Server error while resetting settings",
            error: error.message
        });
    }
};

/**
 * Update Profile Photo
 */
export const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 
                success: false, 
                message: "Profile photo is required" 
            });
        }

        const profilePhoto = await uploadToS3(file, 'profiles');

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 'profile.profilePhoto': profilePhoto },
            { new: true }
        ).select('-password');

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
            message: "Server error while updating profile photo",
            error: error.message
        });
    }
};
