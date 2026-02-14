import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToS3 } from "../utils/s3Upload.js";
import nodemailer from 'nodemailer';
import { getKafkaProducer, UserCreatedEvent, TOPICS } from '../../shared-kafka/index.js';

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, cnic, role, recruiterType, companyId } = req.body;

        // Only require essential fields
        if (!fullname || !email || !password || !role) {
            return res.status(400).json({
                message: "Full name, email, password, and role are required.",
                success: false,
            });
        }

        // Validate recruiter type for recruiters
        if (role === 'Recruiter' && !recruiterType) {
            return res.status(400).json({
                message: "Recruiter type (Individual or Company) is required for recruiters.",
                success: false,
            });
        }

        if (role === 'Recruiter' && !['Individual', 'Company'].includes(recruiterType)) {
            return res.status(400).json({
                message: "Invalid recruiter type. Must be either 'Individual' or 'Company'.",
                success: false,
            });
        }

        const file = req.file;
        let profilePhoto = null;

        if (file) {
            profilePhoto = await uploadToS3(file, 'profiles');
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            cnic,
            role,
            profile: {
                profilePhoto: profilePhoto,
            },
        };

        // Add recruiter type only for recruiters or company owners
        if (role === 'Recruiter' || role === 'Company') {
            userData.recruiterType = recruiterType || 'Company';
        }

        // Add company ID if provided (for Company Owners or Company Recruiters)
        if (companyId) {
            userData.companyId = companyId;
            userData.profile.company = companyId;
            userData.profileCompleted = true; // Assume profile is completed if coming from company registration
        }

        const newUser = await User.create(userData);

        // Publish user.created event to Kafka
        try {
            const producer = getKafkaProducer('auth-service');
            const event = new UserCreatedEvent({
                userId: newUser._id.toString(),
                email: newUser.email,
                name: newUser.fullname,
                role: newUser.role,
                phoneNumber: newUser.phoneNumber
            }, {
                source: 'auth-service',
                correlationId: req.headers['x-correlation-id'] || `reg-${Date.now()}`
            });

            await producer.publishEvent(TOPICS.USER_CREATED, event, newUser._id.toString());
            console.log('✅ Published user.created event for:', newUser.email);
        } catch (kafkaError) {
            // Log error but don't fail registration
            console.error('⚠️ Failed to publish user.created event:', kafkaError);
        }

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: {
                _id: newUser._id,
                email: newUser.email,
                fullname: newUser.fullname,
                role: newUser.role,
                companyId: newUser.companyId
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            message: "An error occurred during registration.",
            success: false,
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        const tokenData = {
            userId: user._id,
            role: user.role,
            recruiterType: user.recruiterType,
            ...(user.companyId && { companyId: user.companyId })
        };
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '7d' });

        const userForResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            cnic: user.cnic,
            role: user.role,
            recruiterType: user.recruiterType, // Include recruiter type
            companyId: user.companyId, // Include company ID for company recruiters
            profile: user.profile,
        };

        return res.status(200)
            .cookie("token", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                httpOnly: true,
                sameSite: 'strict'
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user: userForResponse,
                // Deliberately do NOT return the JWT token in the JSON response.
                // Authentication is handled via the httpOnly cookie to reduce XSS risk.
                success: true,
            });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "An error occurred during login.",
            success: false,
            error: error.message,
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                message: "Authentication token missing.",
                success: false
            });
        }

        // Verify existing token (even if expired, we might want to check signature if ignoreExpiration option is used, but standard jwt.verify throws on expiry)
        // For simple refresh flow without rotating refresh tokens, we usually rely on the client knowing when to refresh or having a separate long-lived refresh token.
        // Assuming here we are checking validity. If expired, they need to login again unless we implement dual-token (access/refresh) logic properly.
        // Since typical simple JWT auth only has one token, 'refresh-token' endpoint often implies issuing a new one if the old one is valid-but-close-to-expiry 
        // OR checking a separate refresh token.
        // Given current structure, let's assume we decode, verify user exists, and issue new token.

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            return res.status(401).json({
                message: "Invalid or expired token.",
                success: false
            });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const tokenData = {
            userId: user._id,
            role: user.role,
            recruiterType: user.recruiterType,
            ...(user.companyId && { companyId: user.companyId })
        };

        const newToken = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '7d' });

        return res.status(200)
            .cookie("token", newToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'strict'
            })
            .json({
                message: "Token refreshed successfully.",
                success: true,
                user: {
                    ...user.toObject(),
                    companyId: user.companyId // Ensure consistency
                }
            });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({
            message: "Error refreshing token.",
            success: false,
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Try to get user from request if available (from token)
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            // Update user status to offline if we have a valid user
            await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });
        }

        // Always clear cookies and return success, regardless of user authentication status
        // Use the same options that were used when setting the cookie
        return res.status(200).clearCookie("token", {
            httpOnly: true,
            sameSite: 'strict'
        }).json({
            message: "Logged out successfully.",
            success: true,
            userLoggedOut: !!userId
        });
    } catch (error) {
        console.error("Error during logout:", error);
        // Even if there's an error, try to clear cookies and return success
        return res.status(200).clearCookie("token", {
            httpOnly: true,
            sameSite: 'strict'
        }).json({
            message: "Logged out successfully.",
            success: true,
            userLoggedOut: false
        });
    }
};

// Forgot Password Functions
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found with this email.",
                success: false,
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user document
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiry = otpExpiry;
        await user.save();

        // Send email with OTP
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You have requested to reset your password. Use the following OTP to proceed:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "OTP sent to your email successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        return res.status(500).json({
            message: "An error occurred while sending OTP.",
            success: false,
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required.",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        if (user.resetPasswordOtp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP.",
                success: false,
            });
        }

        if (user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({
                message: "OTP has expired.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "OTP verified successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            message: "An error occurred while verifying OTP.",
            success: false,
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP, and new password are required.",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(newPassword, user.password);
        if (isPasswordMatch) {
            return res.status(400).json({
                message: "New password must be different from the current password.",
                success: false,
            });
        }

        if (user.resetPasswordOtp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP.",
                success: false,
            });
        }

        if (user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({
                message: "OTP has expired.",
                success: false,
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({
            message: "An error occurred while resetting password.",
            success: false,
        });
    }
};

// Verify token endpoint (for other services to verify tokens)
export const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Token not provided",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false,
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                ...user.toObject(),
                companyId: decoded.companyId,
                role: decoded.role,
                recruiterType: decoded.recruiterType
            }
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
        });
    }
};

// Get user by ID (for other services)
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify token first (optional - can be made required)
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (token) {
            try {
                jwt.verify(token, process.env.SECRET_KEY);
            } catch (error) {
                return res.status(401).json({
                    message: "Invalid or expired token",
                    success: false,
                });
            }
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        return res.status(200).json({
            success: true,
            user: user.toObject()
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            message: "Error fetching user",
            success: false,
            error: error.message,
        });
    }
};

// Get multiple users by IDs (batch endpoint for other services)
export const getUsersByIds = async (req, res) => {
    try {
        const { userIds } = req.body; // Array of user IDs

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                message: "userIds must be a non-empty array",
                success: false,
            });
        }

        // Verify token
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (token) {
            try {
                jwt.verify(token, process.env.SECRET_KEY);
            } catch (error) {
                return res.status(401).json({
                    message: "Invalid or expired token",
                    success: false,
                });
            }
        }

        const users = await User.find({ _id: { $in: userIds } }).select('-password');

        return res.status(200).json({
            success: true,
            users: users.map(user => user.toObject()),
            count: users.length
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            message: "Error fetching users",
            success: false,
            error: error.message,
        });
    }
};

// Update user Stripe data (for Payment Service)
export const updateUserStripeData = async (req, res) => {
    try {
        const { userId } = req.params;
        const stripeData = req.body; // { customerId, connectAccountId, connectChargesEnabled, detailsSubmitted }

        // Verify token
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Token required",
                success: false,
            });
        }

        try {
            jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Update Stripe data
        if (stripeData.customerId !== undefined) user.stripe.customerId = stripeData.customerId;
        if (stripeData.connectAccountId !== undefined) user.stripe.connectAccountId = stripeData.connectAccountId;
        if (stripeData.connectChargesEnabled !== undefined) user.stripe.connectChargesEnabled = stripeData.connectChargesEnabled;
        if (stripeData.detailsSubmitted !== undefined) user.stripe.detailsSubmitted = stripeData.detailsSubmitted;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Stripe data updated successfully",
            user: {
                _id: user._id,
                stripe: user.stripe
            }
        });
    } catch (error) {
        console.error("Error updating Stripe data:", error);
        return res.status(500).json({
            message: "Error updating Stripe data",
            success: false,
            error: error.message,
        });
    }
};

// Update user wallet balance (for Payment Service)
export const updateUserWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { walletBalance, operation } = req.body; // operation: 'set', 'add', 'subtract'

        // Verify token
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Token required",
                success: false,
            });
        }

        try {
            jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Update wallet balance based on operation
        if (operation === 'set') {
            user.walletBalance = walletBalance;
        } else if (operation === 'add') {
            user.walletBalance = (user.walletBalance || 0) + walletBalance;
        } else if (operation === 'subtract') {
            user.walletBalance = Math.max(0, (user.walletBalance || 0) - walletBalance);
        } else {
            return res.status(400).json({
                message: "Invalid operation. Must be 'set', 'add', or 'subtract'",
                success: false,
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Wallet balance updated successfully",
            user: {
                _id: user._id,
                walletBalance: user.walletBalance
            }
        });
    } catch (error) {
        console.error("Error updating wallet balance:", error);
        return res.status(500).json({
            message: "Error updating wallet balance",
            success: false,
            error: error.message,
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        };
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        })
    }
};

// Update user KYC data (for Payment Service)
export const updateUserKYC = async (req, res) => {
    try {
        const { userId } = req.params;
        const kycData = req.body; // { fatherName, cnicNumber, dateOfBirth, cnicFrontUrl, cnicBackUrl, kycStatus }

        // Verify token
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Token required",
                success: false,
            });
        }

        try {
            jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Update KYC data
        if (!user.kyc) user.kyc = {};
        if (kycData.fatherName !== undefined) user.kyc.fatherName = kycData.fatherName;
        if (kycData.cnicNumber !== undefined) user.kyc.cnicNumber = kycData.cnicNumber;
        if (kycData.dateOfBirth !== undefined) user.kyc.dateOfBirth = kycData.dateOfBirth ? new Date(kycData.dateOfBirth) : undefined;
        if (kycData.cnicFrontUrl !== undefined) user.kyc.cnicFrontUrl = kycData.cnicFrontUrl;
        if (kycData.cnicBackUrl !== undefined) user.kyc.cnicBackUrl = kycData.cnicBackUrl;
        if (kycData.kycStatus !== undefined) user.kyc.kycStatus = kycData.kycStatus;
        if (kycData.remarks !== undefined) user.kyc.remarks = kycData.remarks;
        if (kycData.rejectionReason !== undefined) user.kyc.rejectionReason = kycData.rejectionReason;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "KYC data updated successfully",
            user: {
                _id: user._id,
                kyc: user.kyc
            }
        });
    } catch (error) {
        console.error("Error updating KYC data:", error);
        return res.status(500).json({
            message: "Error updating KYC data",
            success: false,
            error: error.message,
        });
    }
};

// Update user rating (for Review Service)
export const updateUserRating = async (req, res) => {
    try {
        const { userId } = req.params;
        const { averageRating, totalReviews, ratingBreakdown } = req.body;

        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Token required",
                success: false,
            });
        }

        try {
            jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Update rating data
        if (!user.rating) user.rating = {};
        if (averageRating !== undefined) user.rating.averageRating = averageRating;
        if (totalReviews !== undefined) user.rating.totalReviews = totalReviews;
        if (ratingBreakdown !== undefined) user.rating.ratingBreakdown = ratingBreakdown;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            user: {
                _id: user._id,
                rating: user.rating
            }
        });
    } catch (error) {
        console.error("Error updating rating:", error);
        return res.status(500).json({
            message: "Error updating rating",
            success: false,
            error: error.message,
        });
    }
};
