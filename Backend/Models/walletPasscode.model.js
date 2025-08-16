import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const walletPasscodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Encrypted passcode (6-digit numeric)
    hashedPasscode: {
        type: String,
        required: true
    },
    
    // Passcode metadata
    passcodeLength: {
        type: Number,
        default: 6,
        min: 4,
        max: 8
    },
    
    // Security settings
    maxAttempts: {
        type: Number,
        default: 3,
        min: 3,
        max: 10
    },
    
    lockoutDuration: {
        type: Number,
        default: 300, // 5 minutes in seconds
        min: 60, // 1 minute minimum
        max: 3600 // 1 hour maximum
    },
    
    // Current lockout status
    isLocked: {
        type: Boolean,
        default: false
    },
    
    lockoutUntil: Date,
    
    // Attempt tracking
    failedAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    
    lastFailedAttempt: Date,
    
    // Success tracking
    lastSuccessfulAccess: Date,
    accessCount: {
        type: Number,
        default: 0
    },
    
    // Passcode history (for security)
    passcodeHistory: [{
        hashedPasscode: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Security questions (optional backup)
    securityQuestions: [{
        question: {
            type: String,
            required: true
        },
        hashedAnswer: {
            type: String,
            required: true
        }
    }],
    
    // Recovery options
    recoveryEmail: String,
    recoveryPhone: String,
    
    // Expiry and renewal
    expiresAt: Date,
    requiresRenewal: {
        type: Boolean,
        default: false
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Audit trail
    changeHistory: [{
        action: {
            type: String,
            enum: ['created', 'changed', 'reset', 'unlocked', 'locked']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        ipAddress: String,
        userAgent: String
    }]
}, {
    timestamps: true
});

// Indexes
walletPasscodeSchema.index({ userId: 1 });
walletPasscodeSchema.index({ isLocked: 1 });
walletPasscodeSchema.index({ lockoutUntil: 1 });
walletPasscodeSchema.index({ expiresAt: 1 });

// Pre-save middleware
walletPasscodeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to verify passcode
walletPasscodeSchema.methods.verifyPasscode = async function(inputPasscode) {
    // Check if wallet is locked
    if (this.isLocked && this.lockoutUntil > new Date()) {
        return {
            success: false,
            locked: true,
            remainingTime: Math.ceil((this.lockoutUntil - new Date()) / 1000)
        };
    }
    
    // Verify passcode
    const isValid = await bcrypt.compare(inputPasscode, this.hashedPasscode);
    
    if (isValid) {
        // Reset failed attempts on successful verification
        this.failedAttempts = 0;
        this.isLocked = false;
        this.lockoutUntil = undefined;
        this.lastSuccessfulAccess = new Date();
        this.accessCount += 1;
        
        // Add to change history
        this.changeHistory.push({
            action: 'unlocked',
            timestamp: new Date(),
            performedBy: this.userId
        });
        
        await this.save();
        
        return {
            success: true,
            locked: false
        };
    } else {
        // Increment failed attempts
        this.failedAttempts += 1;
        this.lastFailedAttempt = new Date();
        
        // Check if should lock
        if (this.failedAttempts >= this.maxAttempts) {
            this.isLocked = true;
            this.lockoutUntil = new Date(Date.now() + this.lockoutDuration * 1000);
            
            // Add to change history
            this.changeHistory.push({
                action: 'locked',
                timestamp: new Date(),
                performedBy: this.userId
            });
        }
        
        await this.save();
        
        return {
            success: false,
            locked: this.isLocked,
            remainingAttempts: this.maxAttempts - this.failedAttempts,
            lockoutUntil: this.lockoutUntil
        };
    }
};

// Method to change passcode
walletPasscodeSchema.methods.changePasscode = async function(newPasscode, changedBy) {
    // Hash new passcode
    const hashedNewPasscode = await bcrypt.hash(newPasscode, 12);
    
    // Add current passcode to history
    this.passcodeHistory.push({
        hashedPasscode: this.hashedPasscode,
        createdAt: new Date(),
        changedBy: changedBy || this.userId
    });
    
    // Keep only last 5 passcodes in history
    if (this.passcodeHistory.length > 5) {
        this.passcodeHistory = this.passcodeHistory.slice(-5);
    }
    
    // Update passcode
    this.hashedPasscode = hashedNewPasscode;
    this.failedAttempts = 0;
    this.isLocked = false;
    this.lockoutUntil = undefined;
    
    // Add to change history
    this.changeHistory.push({
        action: 'changed',
        timestamp: new Date(),
        performedBy: changedBy || this.userId
    });
    
    return this.save();
};

// Method to reset passcode (admin function)
walletPasscodeSchema.methods.resetPasscode = async function(newPasscode, resetBy) {
    // Hash new passcode
    const hashedNewPasscode = await bcrypt.hash(newPasscode, 12);
    
    // Add current passcode to history
    this.passcodeHistory.push({
        hashedPasscode: this.hashedPasscode,
        createdAt: new Date(),
        changedBy: resetBy
    });
    
    // Update passcode
    this.hashedPasscode = hashedNewPasscode;
    this.failedAttempts = 0;
    this.isLocked = false;
    this.lockoutUntil = undefined;
    
    // Add to change history
    this.changeHistory.push({
        action: 'reset',
        timestamp: new Date(),
        performedBy: resetBy
    });
    
    return this.save();
};

// Method to unlock wallet (admin function)
walletPasscodeSchema.methods.unlockWallet = async function(unlockedBy) {
    this.isLocked = false;
    this.lockoutUntil = undefined;
    this.failedAttempts = 0;
    
    // Add to change history
    this.changeHistory.push({
        action: 'unlocked',
        timestamp: new Date(),
        performedBy: unlockedBy
    });
    
    return this.save();
};

// Method to check if passcode is in history
walletPasscodeSchema.methods.isPasscodeInHistory = async function(inputPasscode) {
    for (const historyItem of this.passcodeHistory) {
        if (await bcrypt.compare(inputPasscode, historyItem.hashedPasscode)) {
            return true;
        }
    }
    return false;
};

// Static method to create passcode for user
walletPasscodeSchema.statics.createForUser = async function(userId, passcode, createdBy) {
    // Check if user already has a passcode
    const existing = await this.findOne({ userId });
    if (existing) {
        throw new Error('User already has a wallet passcode');
    }
    
    // Hash the passcode
    const hashedPasscode = await bcrypt.hash(passcode, 12);
    
    // Create new passcode record
    const walletPasscode = new this({
        userId,
        hashedPasscode,
        createdBy: createdBy || userId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });
    
    // Add to change history
    walletPasscode.changeHistory.push({
        action: 'created',
        timestamp: new Date(),
        performedBy: createdBy || userId
    });
    
    return walletPasscode.save();
};

// Static method to get passcode by user ID
walletPasscodeSchema.statics.getByUserId = function(userId) {
    return this.findOne({ userId });
};

// Static method to get all locked wallets
walletPasscodeSchema.statics.getLockedWallets = function() {
    return this.find({ isLocked: true }).populate('userId', 'fullname email');
};

export const WalletPasscode = mongoose.model("WalletPasscode", walletPasscodeSchema);
