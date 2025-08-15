import { User } from "../Models/user.model.js";
import SystemSettings from "../Models/systemSettings.model.js";

export class SettingsService {
  // Get user settings
  static async getUserSettings(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        settings: {
          profile: {
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            bio: user.profile?.bio || '',
            location: user.profile?.location || '',
            website: user.profile?.website || '',
            profilePhoto: user.profile?.profilePhoto || '/default-avatar.png'
          },
          settings: {
            language: user.settings?.language || 'en',
            currency: user.settings?.currency || 'USD',
            timezone: user.settings?.timezone || 'UTC',
            dateFormat: user.settings?.dateFormat || 'MM/DD/YYYY',
            timeFormat: user.settings?.timeFormat || '12h',
            weekStart: user.settings?.weekStart || 'monday'
          },
          appearance: {
            darkMode: user.darkMode || false
          },
          privacy: {
            profileVisibility: user.privacy?.profileVisibility || 'public',
            showEmail: user.privacy?.showEmail || false,
            showPhone: user.privacy?.showPhone || false,
            allowMessages: user.privacy?.allowMessages || true,
            showOnlineStatus: user.privacy?.showOnlineStatus || true,
            showLastSeen: user.privacy?.showLastSeen || true
          },
          notifications: {
            emailNotifications: user.notificationPreferences?.emailNotifications || true,
            pushNotifications: user.notificationPreferences?.pushNotifications || true,
            smsNotifications: user.notificationPreferences?.smsNotifications || false,
            marketingEmails: user.notificationPreferences?.marketingEmails || false,
            jobAlerts: user.notificationPreferences?.jobAlerts || true,
            messageAlerts: user.notificationPreferences?.messageAlerts || true,
            projectUpdates: user.notificationPreferences?.projectUpdates || true,
            paymentNotifications: user.notificationPreferences?.paymentNotifications || true
          },
          social: {
            linkedin: user.socialLinks?.linkedin || '',
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || ''
          },
          professional: {
            certifications: user.certifications || [],
            courses: user.courses || [],
            skills: user.profile?.skills || []
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user settings
  static async updateUserSettings(userId, updateData) {
    try {
      console.log('updateUserSettings called with:', { userId, updateData });
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate and prepare update fields
      const updateFields = {};
      
      // Profile fields
      if (updateData.fullname) {
        if (updateData.fullname.trim().length < 2) {
          throw new Error('Full name must be at least 2 characters long');
        }
        updateFields.fullname = updateData.fullname.trim();
      }
      
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          throw new Error('Invalid email format');
        }
        updateFields.email = updateData.email.toLowerCase();
      }
      
      if (updateData.phone) {
        if (!/^\d{10,15}$/.test(updateData.phone)) {
          throw new Error('Invalid phone number format');
        }
        updateFields.phoneNumber = updateData.phone;
      }
      
      if (updateData.bio) {
        if (updateData.bio.length > 500) {
          throw new Error('Bio must be less than 500 characters');
        }
        updateFields['profile.bio'] = updateData.bio;
      }
      
      if (updateData.location) {
        updateFields['profile.location'] = updateData.location;
      }
      
      if (updateData.website) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(updateData.website)) {
          throw new Error('Website must start with http:// or https://');
        }
        updateFields['profile.website'] = updateData.website;
      }
      
      // Settings fields
      if (updateData.language) {
        const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko', 'ur'];
        if (!validLanguages.includes(updateData.language)) {
          throw new Error('Invalid language selection');
        }
        updateFields['settings.language'] = updateData.language;
      }
      
      // Handle direct language updates (not nested under settings)
      if (updateData.language && !updateData.settings) {
        updateFields.language = updateData.language;
      }
      
      if (updateData.currency) {
        const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
        if (!validCurrencies.includes(updateData.currency)) {
          throw new Error('Invalid currency selection');
        }
        updateFields['settings.currency'] = updateData.currency;
      }
      
      if (updateData.timezone) {
        const validTimezones = [
          'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
          'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'
        ];
        if (!validTimezones.includes(updateData.timezone)) {
          throw new Error('Invalid timezone selection');
        }
        updateFields['settings.timezone'] = updateData.timezone;
      }
      
      if (updateData.dateFormat) {
        const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
        if (!validDateFormats.includes(updateData.dateFormat)) {
          throw new Error('Invalid date format selection');
        }
        updateFields['settings.dateFormat'] = updateData.dateFormat;
      }
      
      if (updateData.timeFormat) {
        const validTimeFormats = ['12h', '24h'];
        if (!validTimeFormats.includes(updateData.timeFormat)) {
          throw new Error('Invalid time format selection');
        }
        updateFields['settings.timeFormat'] = updateData.timeFormat;
      }
      
      if (updateData.weekStart) {
        const validWeekStarts = ['monday', 'sunday'];
        if (!validWeekStarts.includes(updateData.weekStart)) {
          throw new Error('Invalid week start selection');
        }
        updateFields['settings.weekStart'] = updateData.weekStart;
      }
      
      // Handle direct settings updates (not nested under settings)
      if (updateData.currency && !updateData.settings) {
        updateFields.currency = updateData.currency;
      }
      if (updateData.timezone && !updateData.settings) {
        updateFields.timezone = updateData.timezone;
      }
      if (updateData.dateFormat && !updateData.settings) {
        updateFields.dateFormat = updateData.dateFormat;
      }
      if (updateData.timeFormat && !updateData.settings) {
        updateFields.timeFormat = updateData.timeFormat;
      }
      if (updateData.weekStart && !updateData.settings) {
        updateFields.weekStart = updateData.weekStart;
      }
      
      // Appearance
      if (typeof updateData.darkMode === 'boolean') {
        updateFields.darkMode = updateData.darkMode;
      }
      
      // Ensure boolean fields are properly typed
      if (updateData.darkMode !== undefined) {
        updateFields.darkMode = Boolean(updateData.darkMode);
      }
      
      // Privacy settings
      if (updateData.profileVisibility) {
        const validVisibilities = ['public', 'registered', 'private'];
        if (!validVisibilities.includes(updateData.profileVisibility)) {
          throw new Error('Invalid profile visibility selection');
        }
        updateFields['privacy.profileVisibility'] = updateData.profileVisibility;
      }
      
      // Handle direct privacy updates (not nested under privacy)
      if (updateData.profileVisibility && !updateData.privacy) {
        updateFields.profileVisibility = updateData.profileVisibility;
      }
      
      if (updateData.showEmail !== undefined) {
        updateFields['privacy.showEmail'] = Boolean(updateData.showEmail);
      }
      
      if (updateData.showPhone !== undefined) {
        updateFields['privacy.showPhone'] = Boolean(updateData.showPhone);
      }
      
      if (updateData.allowMessages !== undefined) {
        updateFields['privacy.allowMessages'] = Boolean(updateData.allowMessages);
      }
      
      if (updateData.showOnlineStatus !== undefined) {
        updateFields['privacy.showOnlineStatus'] = Boolean(updateData.showOnlineStatus);
      }
      
      if (updateData.showLastSeen !== undefined) {
        updateFields['privacy.showLastSeen'] = Boolean(updateData.showLastSeen);
      }
      
      // Handle direct privacy updates (not nested under privacy)
      if (!updateData.privacy) {
        if (updateData.showEmail !== undefined) {
          updateFields.showEmail = Boolean(updateData.showEmail);
        }
        if (updateData.showPhone !== undefined) {
          updateFields.showPhone = Boolean(updateData.showPhone);
        }
        if (updateData.allowMessages !== undefined) {
          updateFields.allowMessages = Boolean(updateData.allowMessages);
        }
        if (updateData.showOnlineStatus !== undefined) {
          updateFields.showOnlineStatus = Boolean(updateData.showOnlineStatus);
        }
        if (updateData.showLastSeen !== undefined) {
          updateFields.showLastSeen = Boolean(updateData.showLastSeen);
        }
      }
      
      // Notification preferences
      if (updateData.emailNotifications !== undefined) {
        updateFields['notificationPreferences.emailNotifications'] = Boolean(updateData.emailNotifications);
      }
      
      // Handle direct notification updates (not nested under notificationPreferences)
      if (updateData.emailNotifications !== undefined && !updateData.notificationPreferences) {
        updateFields.emailNotifications = Boolean(updateData.emailNotifications);
      }
      
      if (updateData.pushNotifications !== undefined) {
        updateFields['notificationPreferences.pushNotifications'] = Boolean(updateData.pushNotifications);
      }
      
      if (updateData.smsNotifications !== undefined) {
        updateFields['notificationPreferences.smsNotifications'] = Boolean(updateData.smsNotifications);
      }
      
      if (updateData.marketingEmails !== undefined) {
        updateFields['notificationPreferences.marketingEmails'] = Boolean(updateData.marketingEmails);
      }
      
      if (updateData.jobAlerts !== undefined) {
        updateFields['notificationPreferences.jobAlerts'] = Boolean(updateData.jobAlerts);
      }
      
      if (updateData.messageAlerts !== undefined) {
        updateFields['notificationPreferences.messageAlerts'] = Boolean(updateData.messageAlerts);
      }
      
      if (updateData.projectUpdates !== undefined) {
        updateFields['notificationPreferences.projectUpdates'] = Boolean(updateData.projectUpdates);
      }
      
      if (updateData.paymentNotifications !== undefined) {
        updateFields['notificationPreferences.paymentNotifications'] = Boolean(updateData.paymentNotifications);
      }
      
      // Handle direct notification updates (not nested under notificationPreferences)
      if (!updateData.notificationPreferences) {
        if (updateData.pushNotifications !== undefined) {
          updateFields.pushNotifications = Boolean(updateData.pushNotifications);
        }
        if (updateData.smsNotifications !== undefined) {
          updateFields.smsNotifications = Boolean(updateData.smsNotifications);
        }
        if (updateData.marketingEmails !== undefined) {
          updateFields.marketingEmails = Boolean(updateData.marketingEmails);
        }
        if (updateData.jobAlerts !== undefined) {
          updateFields.jobAlerts = Boolean(updateData.jobAlerts);
        }
        if (updateData.messageAlerts !== undefined) {
          updateFields.messageAlerts = Boolean(updateData.messageAlerts);
        }
        if (updateData.projectUpdates !== undefined) {
          updateFields.projectUpdates = Boolean(updateData.projectUpdates);
        }
        if (updateData.paymentNotifications !== undefined) {
          updateFields.paymentNotifications = Boolean(updateData.paymentNotifications);
        }
      }
      
      // Social links
      if (updateData.socialLinks) {
        if (updateData.socialLinks.linkedin) {
          if (updateData.socialLinks.linkedin.trim() === '') {
            updateFields['socialLinks.linkedin'] = '';
          } else {
            const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/;
            if (!linkedinRegex.test(updateData.socialLinks.linkedin)) {
              throw new Error('Invalid LinkedIn URL format');
            }
            updateFields['socialLinks.linkedin'] = updateData.socialLinks.linkedin;
          }
        }
        
        if (updateData.socialLinks.twitter) {
          if (updateData.socialLinks.twitter.trim() === '') {
            updateFields['socialLinks.twitter'] = '';
          } else {
            const twitterRegex = /^https?:\/\/(www\.)?twitter\.com\/.+/;
            if (!twitterRegex.test(updateData.socialLinks.twitter)) {
              throw new Error('Invalid Twitter URL format');
            }
            updateFields['socialLinks.twitter'] = updateData.socialLinks.twitter;
          }
        }
        
        if (updateData.socialLinks.github) {
          if (updateData.socialLinks.github.trim() === '') {
            updateFields['socialLinks.github'] = '';
          } else {
            const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+/;
            if (!githubRegex.test(updateData.socialLinks.github)) {
              throw new Error('Invalid GitHub URL format');
            }
            updateFields['socialLinks.github'] = updateData.socialLinks.github;
          }
        }
      }
      
      // Professional info
      if (updateData.certifications) {
        if (Array.isArray(updateData.certifications)) {
          // Convert string array to certification objects if needed
          const validCertifications = updateData.certifications
            .filter(cert => cert && typeof cert === 'string' && cert.trim().length > 0)
            .map(cert => typeof cert === 'string' ? { title: cert.trim(), imageUrl: '' } : cert);
          updateFields.certifications = validCertifications;
        }
      }
      
      if (updateData.courses) {
        if (Array.isArray(updateData.courses)) {
          updateFields.courses = updateData.courses.filter(course => course && typeof course === 'string' && course.trim().length > 0);
        }
      }
      
      if (updateData.skills) {
        if (Array.isArray(updateData.skills)) {
          updateFields['profile.skills'] = updateData.skills.filter(skill => skill.trim().length > 0);
        }
      }

      // Update user
      console.log('Updating user with fields:', updateFields);
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: true }
      );

      // Remove password from response
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: 'Settings updated successfully',
        user: userResponse
      };
      
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get system settings
  static async getSystemSettings() {
    try {
      const settings = await SystemSettings.getOrCreate();
      return {
        success: true,
        settings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update system settings
  static async updateSystemSettings(updateData) {
    try {
      const settings = await SystemSettings.getOrCreate();
      
      // Update allowed fields
      if (updateData.general) {
        Object.assign(settings.general, updateData.general);
      }
      
      if (updateData.security) {
        Object.assign(settings.security, updateData.security);
      }
      
      if (updateData.payment) {
        Object.assign(settings.payment, updateData.payment);
      }
      
      await settings.save();
      
      return {
        success: true,
        message: 'System settings updated successfully',
        settings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
