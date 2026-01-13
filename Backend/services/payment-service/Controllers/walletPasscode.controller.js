import { WalletPasscode } from "../Models/walletPasscode.model.js";
import { AuthServiceClient } from "../Services/auth-client.service.js";

/**
 * Create wallet passcode for user
 */
export const createWalletPasscode = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const { passcode } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        
        if (!passcode || passcode.length !== 6 || !/^\d+$/.test(passcode)) {
            return res.status(400).json({
                success: false,
                message: "Passcode must be exactly 6 digits"
            });
        }

        // Check if user already has a passcode
        const existingPasscode = await WalletPasscode.findOne({ userId });
        if (existingPasscode) {
            return res.status(400).json({
                success: false,
                message: "Wallet passcode already exists for this user"
            });
        }

        // Check if user has verified KYC via Auth Service
        const user = await AuthServiceClient.getUser(userId, token);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.kyc || user.kyc.kycStatus !== 'verified') {
            return res.status(400).json({
                success: false,
                message: "KYC must be verified before creating wallet passcode"
            });
        }

        // Create wallet passcode
        const walletPasscode = await WalletPasscode.createForUser(userId, passcode, userId);

        res.status(201).json({
            success: true,
            message: "Wallet passcode created successfully",
            data: {
                id: walletPasscode._id,
                createdAt: walletPasscode.createdAt,
                expiresAt: walletPasscode.expiresAt
            }
        });

    } catch (error) {
        console.error("Error creating wallet passcode:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Verify wallet passcode
 */
export const verifyWalletPasscode = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const { passcode } = req.body;
        
        if (!passcode || passcode.length !== 6 || !/^\d+$/.test(passcode)) {
            return res.status(400).json({
                success: false,
                message: "Passcode must be exactly 6 digits"
            });
        }

        const walletPasscode = await WalletPasscode.findOne({ userId });
        if (!walletPasscode) {
            return res.status(404).json({
                success: false,
                message: "Wallet passcode not found"
            });
        }

        const result = await walletPasscode.verifyPasscode(passcode);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: "Passcode verified successfully",
                data: {
                    isLocked: false,
                    remainingAttempts: walletPasscode.maxAttempts
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid passcode",
                data: {
                    isLocked: result.locked,
                    remainingAttempts: result.remainingAttempts,
                    lockoutUntil: result.lockoutUntil
                }
            });
        }

    } catch (error) {
        console.error("Error verifying wallet passcode:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Change wallet passcode
 */
export const changeWalletPasscode = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const { currentPasscode, newPasscode } = req.body;
        
        if (!currentPasscode || !newPasscode) {
            return res.status(400).json({
                success: false,
                message: "Both current and new passcodes are required"
            });
        }

        if (newPasscode.length !== 6 || !/^\d+$/.test(newPasscode)) {
            return res.status(400).json({
                success: false,
                message: "New passcode must be exactly 6 digits"
            });
        }

        const walletPasscode = await WalletPasscode.findOne({ userId });
        if (!walletPasscode) {
            return res.status(404).json({
                success: false,
                message: "Wallet passcode not found"
            });
        }

        // Verify current passcode first
        const currentVerification = await walletPasscode.verifyPasscode(currentPasscode);
        if (!currentVerification.success) {
            return res.status(400).json({
                success: false,
                message: "Current passcode is incorrect",
                data: {
                    isLocked: currentVerification.locked,
                    remainingAttempts: currentVerification.remainingAttempts
                }
            });
        }

        // Check if new passcode is in history
        const isInHistory = await walletPasscode.isPasscodeInHistory(newPasscode);
        if (isInHistory) {
            return res.status(400).json({
                success: false,
                message: "New passcode cannot be the same as a previously used passcode"
            });
        }

        // Change passcode
        await walletPasscode.changePasscode(newPasscode, userId);

        res.status(200).json({
            success: true,
            message: "Wallet passcode changed successfully",
            data: {
                updatedAt: walletPasscode.updatedAt
            }
        });

    } catch (error) {
        console.error("Error changing wallet passcode:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Reset wallet passcode (admin function)
 */
export const resetWalletPasscode = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPasscode } = req.body;
        const adminId = req.user.userId || req.user._id;
        
        if (!newPasscode || newPasscode.length !== 6 || !/^\d+$/.test(newPasscode)) {
            return res.status(400).json({
                success: false,
                message: "New passcode must be exactly 6 digits"
            });
        }

        const walletPasscode = await WalletPasscode.findOne({ userId });
        if (!walletPasscode) {
            return res.status(404).json({
                success: false,
                message: "Wallet passcode not found for this user"
            });
        }

        await walletPasscode.resetPasscode(newPasscode, adminId);

        res.status(200).json({
            success: true,
            message: "Wallet passcode reset successfully",
            data: {
                updatedAt: walletPasscode.updatedAt
            }
        });

    } catch (error) {
        console.error("Error resetting wallet passcode:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Unlock wallet (admin function)
 */
export const unlockWallet = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.userId || req.user._id;
        
        const walletPasscode = await WalletPasscode.findOne({ userId });
        if (!walletPasscode) {
            return res.status(404).json({
                success: false,
                message: "Wallet passcode not found for this user"
            });
        }

        if (!walletPasscode.isLocked) {
            return res.status(400).json({
                success: false,
                message: "Wallet is not currently locked"
            });
        }

        await walletPasscode.unlockWallet(adminId);

        res.status(200).json({
            success: true,
            message: "Wallet unlocked successfully",
            data: {
                isLocked: false,
                updatedAt: walletPasscode.updatedAt
            }
        });

    } catch (error) {
        console.error("Error unlocking wallet:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get wallet passcode status
 */
export const getWalletPasscodeStatus = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        
        const walletPasscode = await WalletPasscode.findOne({ userId });
        if (!walletPasscode) {
            return res.status(200).json({
                success: true,
                data: {
                    hasPasscode: false,
                    isLocked: false,
                    remainingAttempts: 3
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                hasPasscode: true,
                isLocked: walletPasscode.isLocked,
                lockoutUntil: walletPasscode.lockoutUntil,
                remainingAttempts: walletPasscode.maxAttempts - walletPasscode.failedAttempts,
                lastSuccessfulAccess: walletPasscode.lastSuccessfulAccess,
                accessCount: walletPasscode.accessCount,
                expiresAt: walletPasscode.expiresAt
            }
        });

    } catch (error) {
        console.error("Error getting wallet passcode status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get all locked wallets (admin function)
 */
export const getLockedWallets = async (req, res) => {
    try {
        const lockedWallets = await WalletPasscode.getLockedWallets();
        
        // Enrich with user data
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const enrichedWallets = await Promise.all(
            lockedWallets.map(async (wallet) => {
                try {
                    const user = await AuthServiceClient.getUser(wallet.userId, token);
                    return {
                        ...wallet.toObject(),
                        user: user ? {
                            _id: user._id,
                            fullname: user.fullname,
                            email: user.email
                        } : null
                    };
                } catch (error) {
                    return wallet.toObject();
                }
            })
        );
        
        res.status(200).json({
            success: true,
            data: {
                lockedWallets: enrichedWallets,
                totalLocked: enrichedWallets.length
            }
        });

    } catch (error) {
        console.error("Error getting locked wallets:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Delete wallet passcode (admin function)
 */
export const deleteWalletPasscode = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const walletPasscode = await WalletPasscode.findOne({ userId });
        if (!walletPasscode) {
            return res.status(404).json({
                success: false,
                message: "Wallet passcode not found for this user"
            });
        }

        await WalletPasscode.findByIdAndDelete(walletPasscode._id);

        res.status(200).json({
            success: true,
            message: "Wallet passcode deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting wallet passcode:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
