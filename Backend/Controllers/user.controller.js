import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import escapeRegex from 'escape-string-regexp';
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, cnic, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !cnic || !role) {
            return res.status(400).json({
                message: "All fields are required.", // More specific message
                success: false,
            });
        }

        const file = req.file;
        let profilePhoto = null; // Initialize to null

        if (file) { // Only process file if it exists
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
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
                profilePhoto: profilePhoto, // Use the variable, may be null
            },
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error registering user:", error); // Log the error with more context
        return res.status(500).json({
            message: "An error occurred during registration.",
            success: false,
            error: error.message, // Send the error message to the client
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password, and role are required.", // More specific message
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

        // Create user object for response (more efficient)
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
                httpOnly: true, // Important for security!
                sameSite: 'strict' // Important for security!
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
            error: error.message, // Send the error message to the client
        });
    }
};

export const logout = async (req, res) => {
    try {
        if (!req.user) {  // Check if req.user is defined
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
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        let profilePhoto = null;

        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
        }


        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        const userId = req.user._id; // Use req.user._id (consistent)
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false,
            });
        }

        // Update user data (more efficient)
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;
        if (profilePhoto) user.profile.profilePhoto = profilePhoto; // Update profilePhoto

        await user.save();

        // Create user object for response (more efficient)
        const userForResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            cnic: user.cnic,
            profile: user.profile,
        };


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
            error: error.message, // Send the error message to the client
        });
    }
};
export const getUsersForChat = async (req, res) => {
    try {
        // Add any filtering or exclusion logic here if needed
        const users = await User.find({}) 
          .select('fullname email phoneNumber profile') // Select only necessary fields
          .sort({ fullname: 1 }); // Sort alphabetically by fullname

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