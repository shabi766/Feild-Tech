import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToS3 } from "../utils/s3Upload.js";
import escapeRegex from 'escape-string-regexp';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, cnic, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !cnic || !role) {
            return res.status(400).json({
                message: "All fields are required.",
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

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            cnic,
            role,
            profile: {
                profilePhoto: profilePhoto,
            },
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
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
        };
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userForResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            cnic: user.cnic,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200)
            .cookie("token", token, { 
                maxAge: 1 * 24 * 60 * 60 * 1000, 
                httpOnly: true,
                sameSite: 'strict'
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user: userForResponse,
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

export const logout = async (req, res) => {
    try {
        if (!req.user) {
            console.error("User not found in request");
            return res.status(401).json({ 
                message: "Unauthorized: User not logged in", 
                success: false 
            });
        }

        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });

        return res.status(200).clearCookie("token").json({
            message: "Logged out successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({
            message: "An error occurred during logout.",
            success: false,
            error: error.message,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills, age, gender, addressLine1, addressLine2, city, state, country, postalCode, achievements, certifications } = req.body;

        const userId = req.user._id;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found.", success: false });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean);
        if (age) user.age = Number(age);
        if (gender) user.gender = gender;
        user.address = {
            addressLine1: addressLine1 || user.address?.addressLine1,
            addressLine2: addressLine2 || user.address?.addressLine2,
            city: city || user.address?.city,
            state: state || user.address?.state,
            country: country || user.address?.country,
            postalCode: postalCode || user.address?.postalCode,
        };

        // Handle achievements (text array)
        if (achievements !== undefined) {
            if (Array.isArray(achievements)) {
                user.achievements = achievements.filter(Boolean);
            } else if (typeof achievements === 'string') {
                // Accept comma or newline separated
                const list = achievements.split(/\n|,/).map(s => s.trim()).filter(Boolean);
                user.achievements = list;
            }
        }

        // Prepare map of files grouped by fieldname
        const filesMap = new Map();
        if (req.files && Array.isArray(req.files)) {
            for (const f of req.files) {
                if (!filesMap.has(f.fieldname)) filesMap.set(f.fieldname, []);
                filesMap.get(f.fieldname).push(f);
            }
        }

        // Profile photo
        if (filesMap.has('profilePhoto')) {
            const url = await uploadToS3(filesMap.get('profilePhoto')[0], 'profiles');
            user.profile.profilePhoto = url;
        }
        // Resume
        if (filesMap.has('resume')) {
            const url = await uploadToS3(filesMap.get('resume')[0], 'profiles');
            user.profile.resume = url;
            user.profile.resumeOriginalName = filesMap.get('resume')[0].originalname;
        }
        // CNIC images (optional legacy)
        if (filesMap.has('cnicImages')) {
            for (const file of filesMap.get('cnicImages')) {
                const url = await uploadToS3(file, 'profiles');
                user.cnicImages = [...(user.cnicImages || []), url];
            }
        }

        // Certifications: expect parallel arrays: certificationsTitles[] and certificationsImages[]
        // Titles come via body as JSON string or repeated fields
        let certificationTitles = [];
        if (certifications) {
            try {
                const parsed = JSON.parse(certifications);
                if (Array.isArray(parsed)) certificationTitles = parsed.map(t => String(t));
            } catch {
                // fallback to comma/newline split
                certificationTitles = String(certifications).split(/\n|,/).map(s => s.trim()).filter(Boolean);
            }
        }
        const certificationFiles = filesMap.get('certificationImages') || [];
        // Build certifications array aligning images to titles by index
        if (certificationTitles.length || certificationFiles.length) {
            const maxLen = Math.max(certificationTitles.length, certificationFiles.length);
            const built = [];
            for (let i = 0; i < maxLen; i++) {
                let imageUrl = undefined;
                if (certificationFiles[i]) {
                    imageUrl = await uploadToS3(certificationFiles[i], 'profiles');
                }
                built.push({ title: certificationTitles[i] || '', imageUrl });
            }
            // Merge with existing
            user.certifications = [...(user.certifications || []), ...built];
        }

        await user.save();
        const userForResponse = await User.findById(userId).select('-password');

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: userForResponse,
            success: true,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            message: "An error occurred during profile update.",
            success: false,
            error: error.message,
        });
    }
};

export const getUsersForChat = async (req, res) => {
    try {
        const users = await User.find({}) 
          .select('fullname email phoneNumber profile')
          .sort({ fullname: 1 });

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getChatUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find users with whom the current user has chatted
        const chatUsers = await User.find({
            chats: { $in: userId } // Assuming you have a "chats" field in the User model
        }).select('fullname email phoneNumber profile');

        res.status(200).json({ success: true, users: chatUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const searchUsers = async (req, res) => {
    try {
      const { query } = req.query;
      const escapedQuery = escapeRegex(query); // Your escapeRegex function
      const users = await User.find({
        $or: [
          { fullname: { $regex: escapedQuery, $options: 'i' } },
          { email: { $regex: escapedQuery, $options: 'i' } },
        ],
      }).select('fullname email profile _id');
      res.status(200).json(users);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ success: false, message: 'Server error occurred.', error: error.message });
    }
  };

  export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const updateUserSettings = async (req, res) => {
    try {
        const userId = req.params.id;
        const { fullname, email, password, notifications, darkMode, profilePhoto } = req.body;

        let updateFields = { fullname, email, notifications, darkMode, profilePhoto };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user settings:", error);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteAccount = async (req, res) => {
    try {
      const userId = req.params.id; 
  
     
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      
      await User.findByIdAndDelete(userId);
  
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
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