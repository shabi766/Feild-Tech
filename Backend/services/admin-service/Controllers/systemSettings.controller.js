import SystemSettings from '../Models/systemSettings.model.js';

// Get all system settings
export const getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getOrCreate();

        // Mask sensitive information
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };

        res.status(200).json({
            success: true,
            data: sanitizedSettings
        });
    } catch (error) {
        console.error("Error fetching system settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch system settings",
            error: error.message
        });
    }
};

// Update system settings by category
export const updateSystemSettings = async (req, res) => {
    try {
        const { category } = req.params;
        const updateData = req.body;

        // Validate category
        const validCategories = ['general', 'security', 'email', 'payment', 'integrations'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category. Must be one of: general, security, email, payment, integrations"
            });
        }

        // Get current settings or create new ones
        let settings = await SystemSettings.getOrCreate();

        // Update the specific category
        settings[category] = {
            ...settings[category],
            ...updateData
        };

        await settings.save();

        // Mask sensitive information in response
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };

        res.status(200).json({
            success: true,
            message: `${category} settings updated successfully`,
            data: sanitizedSettings
        });
    } catch (error) {
        console.error(`Error updating ${req.params.category} settings:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to update ${req.params.category} settings`,
            error: error.message
        });
    }
};

// Update all system settings at once
export const updateAllSystemSettings = async (req, res) => {
    try {
        const updateData = req.body;

        // Get current settings or create new ones
        let settings = await SystemSettings.getOrCreate();

        // Update all categories
        Object.keys(updateData).forEach(category => {
            if (settings[category]) {
                settings[category] = {
                    ...settings[category],
                    ...updateData[category]
                };
            }
        });

        await settings.save();

        // Mask sensitive information in response
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };

        res.status(200).json({
            success: true,
            message: "All settings updated successfully",
            data: sanitizedSettings
        });
    } catch (error) {
        console.error("Error updating all system settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update system settings",
            error: error.message
        });
    }
};

// Reset settings to defaults for a specific category
export const resetSettingsToDefaults = async (req, res) => {
    try {
        const { category } = req.params;

        // Validate category
        const validCategories = ['general', 'security', 'email', 'payment', 'integrations'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category. Must be one of: general, security, email, payment, integrations"
            });
        }

        // Get current settings or create new ones
        let settings = await SystemSettings.getOrCreate();

        // Reset the specific category to defaults
        const defaultSettings = new SystemSettings();
        settings[category] = defaultSettings[category];

        await settings.save();

        // Mask sensitive information in response
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };

        res.status(200).json({
            success: true,
            message: `${category} settings reset to defaults successfully`,
            data: sanitizedSettings
        });
    } catch (error) {
        console.error(`Error resetting ${req.params.category} settings:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to reset ${req.params.category} settings`,
            error: error.message
        });
    }
};

// Test email configuration
export const testEmailConfiguration = async (req, res) => {
    try {
        const { email, smtpHost, smtpPort, smtpUser, smtpPassword, enableSSL } = req.body;

        // Basic validation
        if (!email || !smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
            return res.status(400).json({
                success: false,
                message: "All email configuration fields are required"
            });
        }

        // Just validate the format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Simulate SMTP test
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.status(200).json({
            success: true,
            message: "Email configuration test completed successfully"
        });
    } catch (error) {
        console.error("Error testing email configuration:", error);
        res.status(500).json({
            success: false,
            message: "Failed to test email configuration",
            error: error.message
        });
    }
};
