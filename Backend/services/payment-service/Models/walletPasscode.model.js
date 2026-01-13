import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const walletPasscodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
        // No ref - belongs to Auth Service
    },
    
    hashedPasscode: {
        type: String,
        required: true
    },
    
    passcodeLength: {
        type: Number,
        default: 6,
        min: 4,
        max: 8
    },
    
    maxAttempts: {
        type: Number,
        default: 3,
        min: 3,
        max: 10
    },
    
    lockoutDuration: {
        type: Number,
        default: 300,
        min: 60,
        max: 3600
    },
    
    isLocked: {
        type: Boolean,
        default: false
    },
    
    lockoutUntil: Date,
    
    failedAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    
    lastFailedAttempt: Date,
    
    lastSuccessfulAccess: Date,
    accessCount: {
        type: Number,
        default: 0
    },
    
    passcodeHistory: [{
        hashedPasscode: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    
    expiresAt: Date,
    requiresRenewal: {
        type: Boolean,
        default: false
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    
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
            type: mongoose.Schema.Types.ObjectId
        }
    }]
}, {
    timestamps: true
});

walletPasscodeSchema.index({ userId: 1 });
walletPasscodeSchema.index({ isLocked: 1 });
walletPasscodeSchema.index({ lockoutUntil: 1 });

walletPasscodeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

walletPasscodeSchema.methods.verifyPasscode = async function(inputPasscode) {
    if (this.isLocked && this.lockoutUntil > new Date()) {
        return {
            success: false,
            locked: true,
            remainingTime: Math.ceil((this.lockoutUntil - new Date()) / 1000)
        };
    }
    
    const isValid = await bcrypt.compare(inputPasscode, this.hashedPasscode);
    
    if (isValid) {
        this.failedAttempts = 0;
        this.isLocked = false;
        this.lockoutUntil = undefined;
        this.lastSuccessfulAccess = new Date();
        this.accessCount += 1;
        
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
        this.failedAttempts += 1;
        this.lastFailedAttempt = new Date();
        
        if (this.failedAttempts >= this.maxAttempts) {
            this.isLocked = true;
            this.lockoutUntil = new Date(Date.now() + this.lockoutDuration * 1000);
            
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

walletPasscodeSchema.methods.changePasscode = async function(newPasscode, changedBy) {
    const hashedNewPasscode = await bcrypt.hash(newPasscode, 12);
    
    this.passcodeHistory.push({
        hashedPasscode: this.hashedPasscode,
        createdAt: new Date(),
        changedBy: changedBy || this.userId
    });
    
    if (this.passcodeHistory.length > 5) {
        this.passcodeHistory = this.passcodeHistory.slice(-5);
    }
    
    this.hashedPasscode = hashedNewPasscode;
    this.failedAttempts = 0;
    this.isLocked = false;
    this.lockoutUntil = undefined;
    
    this.changeHistory.push({
        action: 'changed',
        timestamp: new Date(),
        performedBy: changedBy || this.userId
    });
    
    return this.save();
};

walletPasscodeSchema.methods.resetPasscode = async function(newPasscode, resetBy) {
    const hashedNewPasscode = await bcrypt.hash(newPasscode, 12);
    
    this.passcodeHistory.push({
        hashedPasscode: this.hashedPasscode,
        createdAt: new Date(),
        changedBy: resetBy
    });
    
    this.hashedPasscode = hashedNewPasscode;
    this.failedAttempts = 0;
    this.isLocked = false;
    this.lockoutUntil = undefined;
    
    this.changeHistory.push({
        action: 'reset',
        timestamp: new Date(),
        performedBy: resetBy
    });
    
    return this.save();
};

walletPasscodeSchema.methods.unlockWallet = async function(unlockedBy) {
    this.isLocked = false;
    this.lockoutUntil = undefined;
    this.failedAttempts = 0;
    
    this.changeHistory.push({
        action: 'unlocked',
        timestamp: new Date(),
        performedBy: unlockedBy
    });
    
    return this.save();
};

walletPasscodeSchema.methods.isPasscodeInHistory = async function(inputPasscode) {
    for (const historyItem of this.passcodeHistory) {
        if (await bcrypt.compare(inputPasscode, historyItem.hashedPasscode)) {
            return true;
        }
    }
    return false;
};

walletPasscodeSchema.statics.createForUser = async function(userId, passcode, createdBy) {
    const existing = await this.findOne({ userId });
    if (existing) {
        throw new Error('User already has a wallet passcode');
    }
    
    const hashedPasscode = await bcrypt.hash(passcode, 12);
    
    const walletPasscode = new this({
        userId,
        hashedPasscode,
        createdBy: createdBy || userId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
    
    walletPasscode.changeHistory.push({
        action: 'created',
        timestamp: new Date(),
        performedBy: createdBy || userId
    });
    
    return walletPasscode.save();
};

walletPasscodeSchema.statics.getLockedWallets = function() {
    return this.find({ isLocked: true });
};

export const WalletPasscode = mongoose.model("WalletPasscode", walletPasscodeSchema);
