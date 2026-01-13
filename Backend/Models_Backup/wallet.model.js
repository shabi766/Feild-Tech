import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    // Wallet owner (User or Company)
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'ownerType'
    },
    ownerType: {
        type: String,
        required: true,
        enum: ['User', 'Company']
    },
    
    // Wallet type and hierarchy
    walletType: {
        type: String,
        required: true,
        enum: ['INDIVIDUAL', 'COMPANY_MAIN', 'COMPANY_SUB']
    },
    
    // For sub-wallets, link to company and parent wallet
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: function() {
            return this.walletType === 'COMPANY_SUB';
        }
    },
    parentWalletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: function() {
            return this.walletType === 'COMPANY_SUB';
        }
    },
    
    // Balance and limits
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Metadata
    name: {
        type: String,
        required: function() {
            return this.walletType === 'COMPANY_SUB';
        }
    },
    description: String,
    
    // Permissions (for sub-wallets)
    permissions: {
        canWithdraw: { type: Boolean, default: false },
        canTransfer: { type: Boolean, default: true },
        maxTransferAmount: { type: Number, default: 0 }, // 0 means no limit
        dailyTransferLimit: { type: Number, default: 0 } // 0 means no limit
    }
}, { timestamps: true });

// Indexes for efficient queries
walletSchema.index({ ownerId: 1, ownerType: 1 });
walletSchema.index({ companyId: 1, walletType: 1 });
walletSchema.index({ parentWalletId: 1 });

export const Wallet = mongoose.model("Wallet", walletSchema);
