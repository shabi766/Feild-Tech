import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
    {
        // General Settings
        general: {
            platformName: { type: String, default: "Alpha Project Platform" },
            platformDescription: { type: String, default: "A comprehensive platform for connecting technicians with opportunities" },
            timezone: { type: String, default: "UTC" },
            dateFormat: { type: String, default: "MM/DD/YYYY" },
            language: { type: String, default: "en" },
            maintenanceMode: { type: Boolean, default: false }
        },
        
        // Security Settings
        security: {
            sessionTimeout: { type: Number, default: 30, min: 5, max: 1440 },
            maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 },
            requireTwoFactor: { type: Boolean, default: false },
            passwordMinLength: { type: Number, default: 8, min: 6, max: 32 },
            enableAuditLog: { type: Boolean, default: true },
            ipWhitelist: [{ type: String }]
        },
        
        // Email Settings
        email: {
            smtpHost: { type: String, default: "" },
            smtpPort: { type: Number, default: 587, min: 1, max: 65535 },
            smtpUser: { type: String, default: "" },
            smtpPassword: { type: String, default: "" },
            fromEmail: { type: String, default: "" },
            fromName: { type: String, default: "" },
            enableSSL: { type: Boolean, default: true }
        },
        
        // Payment Settings
        payment: {
            stripeEnabled: { type: Boolean, default: false },
            paypalEnabled: { type: Boolean, default: false },
            defaultCurrency: { type: String, default: "USD" },
            transactionFee: { type: Number, default: 2.9, min: 0, max: 10 },
            minimumWithdrawal: { type: Number, default: 10, min: 1 },
            maximumWithdrawal: { type: Number, default: 10000, min: 1 }
        },
        
        // Integration Settings
        integrations: {
            googleAnalytics: { type: String, default: "" },
            facebookPixel: { type: String, default: "" },
            slackWebhook: { type: String, default: "" },
            webhookUrl: { type: String, default: "" },
            apiRateLimit: { type: Number, default: 1000, min: 100, max: 10000 }
        }
    },
    {
        timestamps: true
    }
);

// Ensure only one system settings document exists
systemSettingsSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await this.constructor.countDocuments();
        if (count > 0) {
            throw new Error('Only one system settings document can exist');
        }
    }
    next();
});

// Static method to get or create system settings
systemSettingsSchema.statics.getOrCreate = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
