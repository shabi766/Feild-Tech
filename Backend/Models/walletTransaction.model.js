import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
    // Transaction type
    type: {
        type: String,
        required: true,
        enum: ['TOPUP', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND', 'ADMIN_ADJUSTMENT']
    },
    
    // Source and destination wallets
    fromWalletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: function() {
            return ['TRANSFER', 'PAYMENT', 'WITHDRAWAL'].includes(this.type);
        }
    },
    toWalletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: function() {
            return ['TRANSFER', 'PAYMENT', 'TOPUP'].includes(this.type);
        }
    },
    
    // Amount and currency
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    currency: {
        type: String,
        default: 'USD'
    },
    
    // Fee information
    fee: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    
    // Status
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']
    },
    
    // Related entities
    workorderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workorder',
        required: function() {
            return this.type === 'PAYMENT';
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    
    // Payment method (for topups/withdrawals)
    paymentMethod: {
        type: String,
        enum: ['CARD', 'BANK_TRANSFER', 'CASH', 'ADMIN']
    },
    
    // Reference numbers
    externalReference: String, // External payment reference
    internalReference: String, // Internal transaction reference
    
    // Metadata
    description: String,
    notes: String,
    
    // Timestamps
    processedAt: Date,
    failedAt: Date,
    cancelledAt: Date
}, { timestamps: true });

// Indexes for efficient queries
walletTransactionSchema.index({ fromWalletId: 1, createdAt: -1 });
walletTransactionSchema.index({ toWalletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ companyId: 1, createdAt: -1 });
walletTransactionSchema.index({ workorderId: 1 });
walletTransactionSchema.index({ status: 1 });
walletTransactionSchema.index({ type: 1 });

export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
