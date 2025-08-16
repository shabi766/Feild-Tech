import { Wallet } from "../Models/wallet.model.js";
import { WalletTransaction } from "../Models/walletTransaction.model.js";
import { User } from "../Models/user.model.js";
import { Company } from "../Models/company.model.js";
import { CompanyUser } from "../Models/companyUser.model.js";
import { Workorder } from "../Models/workorder.model.js";
import mongoose from "mongoose";

// Create wallet for user (individual recruiter or technician)
export const createUserWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({
            ownerId: userId,
            ownerType: 'User',
            walletType: 'INDIVIDUAL'
        });

        if (existingWallet) {
            return res.status(200).json({ 
                success: true, 
                message: "Wallet already exists",
                wallet: existingWallet 
            });
        }

        // Create individual wallet
        const wallet = new Wallet({
            ownerId: userId,
            ownerType: 'User',
            walletType: 'INDIVIDUAL',
            balance: 0,
            currency: 'USD'
        });

        await wallet.save();

        return res.status(201).json({
            success: true,
            message: "Wallet created successfully",
            wallet
        });

    } catch (error) {
        console.error("Error creating user wallet:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create company main wallet (only for company owners)
export const createCompanyWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { companyId } = req.params;

        // Check if user is company owner
        const companyUser = await CompanyUser.findOne({
            userId,
            companyId
        }).populate('roleId');

        if (!companyUser || !companyUser.roleId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Check if user has company owner permissions
        if (companyUser.roleId.roleType !== 'COMPANY_OWNER') {
            return res.status(403).json({
                success: false,
                message: "Only company owners can create company wallets"
            });
        }

        // Check if company wallet already exists
        const existingWallet = await Wallet.findOne({
            ownerId: companyId,
            ownerType: 'Company',
            walletType: 'COMPANY_MAIN'
        });

        if (existingWallet) {
            return res.status(200).json({
                success: true,
                message: "Company wallet already exists",
                wallet: existingWallet
            });
        }

        // Create company main wallet
        const wallet = new Wallet({
            ownerId: companyId,
            ownerType: 'Company',
            walletType: 'COMPANY_MAIN',
            balance: 0,
            currency: 'USD'
        });

        await wallet.save();

        return res.status(201).json({
            success: true,
            message: "Company wallet created successfully",
            wallet
        });

    } catch (error) {
        console.error("Error creating company wallet:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create sub-wallet for company employee (only for company owners)
export const createSubWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { companyId, employeeId } = req.params;
        const { name, description, initialAmount, permissions } = req.body;

        // Check if user is company owner
        const companyUser = await CompanyUser.findOne({
            userId,
            companyId
        }).populate('roleId');

        if (!companyUser || !companyUser.roleId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (companyUser.roleId.roleType !== 'COMPANY_OWNER') {
            return res.status(403).json({
                success: false,
                message: "Only company owners can create sub-wallets"
            });
        }

        // Get company main wallet
        const companyWallet = await Wallet.findOne({
            ownerId: companyId,
            ownerType: 'Company',
            walletType: 'COMPANY_MAIN'
        });

        if (!companyWallet) {
            return res.status(404).json({
                success: false,
                message: "Company wallet not found"
            });
        }

        // Check if sub-wallet already exists for this employee
        const existingSubWallet = await Wallet.findOne({
            ownerId: employeeId,
            ownerType: 'User',
            walletType: 'COMPANY_SUB',
            companyId
        });

        if (existingSubWallet) {
            return res.status(400).json({
                success: false,
                message: "Sub-wallet already exists for this employee"
            });
        }

        // Check if company has sufficient balance
        if (initialAmount && companyWallet.balance < initialAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient company wallet balance"
            });
        }

        // Create sub-wallet
        const subWallet = new Wallet({
            ownerId: employeeId,
            ownerType: 'User',
            walletType: 'COMPANY_SUB',
            companyId,
            parentWalletId: companyWallet._id,
            name: name || 'Employee Wallet',
            description: description || 'Sub-wallet for company employee',
            balance: initialAmount || 0,
            currency: 'USD',
            permissions: {
                canWithdraw: permissions?.canWithdraw || false,
                canTransfer: permissions?.canTransfer || true,
                maxTransferAmount: permissions?.maxTransferAmount || 0,
                dailyTransferLimit: permissions?.dailyTransferLimit || 0
            }
        });

        await subWallet.save();

        // Transfer initial amount from company wallet to sub-wallet
        if (initialAmount && initialAmount > 0) {
            // Update balances
            companyWallet.balance -= initialAmount;
            await companyWallet.save();

            // Create transaction record
            const transaction = new WalletTransaction({
                type: 'TRANSFER',
                fromWalletId: companyWallet._id,
                toWalletId: subWallet._id,
                amount: initialAmount,
                netAmount: initialAmount,
                status: 'COMPLETED',
                userId,
                companyId,
                description: `Initial funding for ${name}`,
                processedAt: new Date()
            });

            await transaction.save();
        }

        return res.status(201).json({
            success: true,
            message: "Sub-wallet created successfully",
            wallet: subWallet
        });

    } catch (error) {
        console.error("Error creating sub-wallet:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get wallet overview for user
export const getWalletOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let wallets = [];
        let companyWallet = null;

        // Get individual wallet
        const individualWallet = await Wallet.findOne({
            ownerId: userId,
            ownerType: 'User',
            walletType: 'INDIVIDUAL'
        });

        if (individualWallet) {
            wallets.push(individualWallet);
        }

        // If user is part of a company, get company wallet info
        if (user.companyId) {
            const companyUser = await CompanyUser.findOne({
                userId,
                companyId: user.companyId
            }).populate('roleId');

            if (companyUser) {
                // Get company main wallet
                const mainWallet = await Wallet.findOne({
                    ownerId: user.companyId,
                    ownerType: 'Company',
                    walletType: 'COMPANY_MAIN'
                });

                if (mainWallet) {
                    companyWallet = {
                        ...mainWallet.toObject(),
                        userRole: companyUser.roleId?.name || 'Unknown',
                        canManage: companyUser.roleId?.roleType === 'COMPANY_OWNER'
                    };
                }

                // Get sub-wallet if user has one
                const subWallet = await Wallet.findOne({
                    ownerId: userId,
                    ownerType: 'User',
                    walletType: 'COMPANY_SUB',
                    companyId: user.companyId
                });

                if (subWallet) {
                    wallets.push(subWallet);
                }
            }
        }

        // Get recent transactions
        const transactions = await WalletTransaction.find({
            $or: [
                { fromWalletId: { $in: wallets.map(w => w._id) } },
                { toWalletId: { $in: wallets.map(w => w._id) } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('fromWalletId', 'name walletType')
        .populate('toWalletId', 'name walletType');

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    role: user.role,
                    companyId: user.companyId
                },
                wallets,
                companyWallet,
                transactions
            }
        });

    } catch (error) {
        console.error("Error getting wallet overview:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Top up wallet (individual users or company owners)
export const topUpWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { walletId, amount, paymentMethod, notes } = req.body;

        if (!walletId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount or wallet ID"
            });
        }

        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }

        // Check permissions
        if (wallet.ownerType === 'User' && wallet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this wallet"
            });
        }

        if (wallet.ownerType === 'Company') {
            const companyUser = await CompanyUser.findOne({
                userId,
                companyId: wallet.ownerId
            }).populate('roleId');

            if (!companyUser || companyUser.roleId.roleType !== 'COMPANY_OWNER') {
                return res.status(403).json({
                    success: false,
                    message: "Only company owners can top up company wallets"
                });
            }
        }

        // Create transaction
        const transaction = new WalletTransaction({
            type: 'TOPUP',
            toWalletId: walletId,
            amount,
            netAmount: amount,
            status: 'COMPLETED',
            userId,
            companyId: wallet.companyId,
            paymentMethod: paymentMethod || 'ADMIN',
            description: notes || 'Wallet top-up',
            processedAt: new Date()
        });

        await transaction.save();

        // Update wallet balance
        wallet.balance += amount;
        await wallet.save();

        return res.status(200).json({
            success: true,
            message: "Wallet topped up successfully",
            data: {
                transaction,
                newBalance: wallet.balance
            }
        });

    } catch (error) {
        console.error("Error topping up wallet:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Transfer funds between wallets
export const transferFunds = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fromWalletId, toWalletId, amount, description } = req.body;

        if (!fromWalletId || !toWalletId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid transfer details"
            });
        }

        const fromWallet = await Wallet.findById(fromWalletId);
        const toWallet = await Wallet.findById(toWalletId);

        if (!fromWallet || !toWallet) {
            return res.status(404).json({
                success: false,
                message: "One or both wallets not found"
            });
        }

        // Check permissions
        if (fromWallet.ownerType === 'User' && fromWallet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied to source wallet"
            });
        }

        // Check if source wallet has sufficient balance
        if (fromWallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance in source wallet"
            });
        }

        // Check transfer limits for sub-wallets
        if (fromWallet.walletType === 'COMPANY_SUB') {
            if (!fromWallet.permissions.canTransfer) {
                return res.status(403).json({
                    success: false,
                    message: "Transfer not allowed from this wallet"
                });
            }

            if (fromWallet.permissions.maxTransferAmount > 0 && amount > fromWallet.permissions.maxTransferAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Transfer amount exceeds maximum limit of $${fromWallet.permissions.maxTransferAmount}`
                });
            }
        }

        // Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update balances
            fromWallet.balance -= amount;
            toWallet.balance += amount;

            await fromWallet.save({ session });
            await toWallet.save({ session });

            // Create transaction record
            const transaction = new WalletTransaction({
                type: 'TRANSFER',
                fromWalletId,
                toWalletId,
                amount,
                netAmount: amount,
                status: 'COMPLETED',
                userId,
                companyId: fromWallet.companyId || toWallet.companyId,
                description: description || 'Fund transfer',
                processedAt: new Date()
            });

            await transaction.save({ session });

            await session.commitTransaction();

            return res.status(200).json({
                success: true,
                message: "Transfer completed successfully",
                data: {
                    transaction,
                    fromWalletBalance: fromWallet.balance,
                    toWalletBalance: toWallet.balance
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error("Error transferring funds:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Pay technician for completed job
export const payTechnician = async (req, res) => {
    try {
        const userId = req.user._id;
        const { workorderId, amount, notes } = req.body;

        if (!workorderId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment details"
            });
        }

        // Get workorder and check if it's completed
        const workorder = await Workorder.findById(workorderId);
        if (!workorder) {
            return res.status(404).json({
                success: false,
                message: "Workorder not found"
            });
        }

        if (workorder.status !== 'Done') {
            return res.status(400).json({
                success: false,
                message: "Workorder must be marked as done before payment"
            });
        }

        // Check if user is authorized to pay
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let sourceWallet = null;

        if (user.role === 'Recruiter') {
            // Individual recruiter - use individual wallet
            sourceWallet = await Wallet.findOne({
                ownerId: userId,
                ownerType: 'User',
                walletType: 'INDIVIDUAL'
            });
        } else if (user.role === 'Company') {
            // Company owner - can use company wallet or sub-wallet
            const companyUser = await CompanyUser.findOne({
                userId,
                companyId: user.companyId
            }).populate('roleId');

            if (companyUser?.roleId?.roleType === 'COMPANY_OWNER') {
                sourceWallet = await Wallet.findOne({
                    ownerId: user.companyId,
                    ownerType: 'Company',
                    walletType: 'COMPANY_MAIN'
                });
            }
        }

        if (!sourceWallet) {
            return res.status(404).json({
                success: false,
                message: "Source wallet not found"
            });
        }

        // Check if source wallet has sufficient balance
        if (sourceWallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance in source wallet"
            });
        }

        // Get technician wallet
        const technicianWallet = await Wallet.findOne({
            ownerId: workorder.assignedApplicant,
            ownerType: 'User',
            walletType: 'INDIVIDUAL'
        });

        if (!technicianWallet) {
            return res.status(404).json({
                success: false,
                message: "Technician wallet not found"
            });
        }

        // Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update balances
            sourceWallet.balance -= amount;
            technicianWallet.balance += amount;

            await sourceWallet.save({ session });
            await technicianWallet.save({ session });

            // Create payment transaction
            const transaction = new WalletTransaction({
                type: 'PAYMENT',
                fromWalletId: sourceWallet._id,
                toWalletId: technicianWallet._id,
                amount,
                netAmount: amount,
                status: 'COMPLETED',
                workorderId,
                userId,
                companyId: user.companyId,
                description: notes || `Payment for workorder ${workorder.title}`,
                processedAt: new Date()
            });

            await transaction.save({ session });

            // Update workorder status to paid
            workorder.status = 'Paid';
            workorder.paidTime = new Date();
            await workorder.save({ session });

            await session.commitTransaction();

            return res.status(200).json({
                success: true,
                message: "Payment completed successfully",
                data: {
                    transaction,
                    workorderStatus: workorder.status,
                    sourceWalletBalance: sourceWallet.balance,
                    technicianWalletBalance: technicianWallet.balance
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error("Error paying technician:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get transaction history
export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { walletId, type, status, limit = 50, page = 1 } = req.query;

        let query = {};

        if (walletId) {
            query.$or = [
                { fromWalletId: walletId },
                { toWalletId: walletId }
            ];
        } else {
            // Get all wallets for user
            const wallets = await Wallet.find({
                ownerId: userId,
                ownerType: 'User'
            });
            
            if (wallets.length > 0) {
                query.$or = [
                    { fromWalletId: { $in: wallets.map(w => w._id) } },
                    { toWalletId: { $in: wallets.map(w => w._id) } }
                ];
            }
        }

        if (type) query.type = type;
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const transactions = await WalletTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('fromWalletId', 'name walletType')
            .populate('toWalletId', 'name walletType')
            .populate('workorderId', 'title');

        const total = await WalletTransaction.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error("Error getting transaction history:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
