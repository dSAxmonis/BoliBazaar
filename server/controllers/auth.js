const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { redisClient } = require('../config/redis');
const { registerUserSchema, loginUserSchema } = require('../config/zodSchemas');
const sendEmail = require('../utils/sendEmail');
const { verifyEmailHtml } = require('../templates/verifyEmailHtml');
const { getOtpHtml } = require('../templates/getOtpHtml');

exports.signup = async (req, res) => {
    try {
        const validation = registerUserSchema.safeParse(req.body);
        
        if (!validation.success) {
             const zoderror = validation.error;
             const allerror = zoderror.issues.map((err) => ({
                field: err.path[0],
                message: err.message
             }));
             
            return res.status(400).json({ 
                success: false,
                message: "Validation error",
                error: allerror
            });
        }

        const { firstName, lastName, email, password, role } = validation.data;

        if (password !== req.body.confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check for image
        let imageData = {
            url: `https://api.dicebear.com/8.x/initials/svg?seed=${firstName} ${lastName}`,
            public_id: null
        };

        if (req.file) {
            try {
                imageData = await uploadToCloudinary(req.file);
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload image to Cloudinary"
                });
            }
        }

        // Generate verification token
        const verifyToken = crypto.randomBytes(32).toString("hex");

        // Hash token before Redis
        const tokenHash = crypto
            .createHash("sha256")
            .update(verifyToken)
            .digest("hex");

        const verifyKey = `verify:${tokenHash}`;

        const dataToStore = JSON.stringify({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            image: imageData,
            role
        });

        // Store verification data in Redis for 5 minutes
        await redisClient.set(verifyKey, dataToStore, { EX: 300 });

        const subject = "Verify your email address - BoliBazaar";
        const emailHtml = verifyEmailHtml({ email, token: verifyToken });

        await sendEmail(email, subject, emailHtml);

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in Signup"
        });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required.",
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const verifyKey = `verify:${tokenHash}`;
        const userDataJson = await redisClient.get(verifyKey);

        if (!userDataJson) {
            return res.status(400).json({
                success: false,
                message: "Verification link is expired or invalid.",
            });
        }

        const userData = JSON.parse(userDataJson);
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const newUser = await User.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            image: userData.image,
            role: userData.role || "User",
        });

        await redisClient.del(verifyKey);

        return res.status(201).json({
            success: true,
            message: "User verified successfully! Your account has been created.",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error in verifyUser:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying user"
        });
    }
};

exports.login = async (req, res) => {
    try {
        const validation = loginUserSchema.safeParse(req.body);
        
        if (!validation.success) {
             const zoderror = validation.error;
             const allerror = zoderror.issues.map((err) => ({
                field: err.path[0],
                message: err.message
             }));
             
            return res.status(400).json({ 
                success: false,
                message: "Validation error",
                error: allerror
            });
        }

        const { email, password } = validation.data;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not registered"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `otp:${email}`;

        // Store OTP in Redis for 5 minutes
        await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

        const subject = "OTP for Login Verification - BoliBazaar";
        const otpHtml = getOtpHtml({ email, otp });

        await sendEmail(email, subject, otpHtml);

        return res.status(200).json({
            success: true,
            message: "An OTP has been sent to your email"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in Login"
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const otpKey = `otp:${email}`;
        const storedOtpString = await redisClient.get(otpKey);

        if (!storedOtpString) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or invalid"
            });
        }

        const storedOtp = JSON.parse(storedOtpString);
        
        if (storedOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Delete OTP from Redis
        await redisClient.del(otpKey);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate JWT token
        const payload = {
            email: user.email,
            id: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h"
        });

        // Send cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                role: user.role || "User",
                token: token
            }
        });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying OTP"
        });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        let { uid, firstName, lastName, email, imageUrl, action } = req.body;

        // Fallback defaults to prevent Mongoose schema validation failures
        if (!firstName) firstName = "Google";
        if (!lastName) lastName = "User";

        let user = await User.findOne({ $or: [{ uid }, { email }] });

        if (!user) {
            if (action === "login") {
                return res.status(400).json({
                    success: false,
                    message: "User not registered. Please sign up first."
                });
            }

            user = new User({
                uid,
                firstName,
                lastName,
                email,
                image: {
                    url: imageUrl || null,
                    public_id: null
                }
            });

            await user.save();
        } else {
            let modified = false;
            if (!user.uid) {
                user.uid = uid;
                modified = true;
            }
            if (imageUrl && (!user.image || !user.image.url)) {
                user.image = { url: imageUrl, public_id: null };
                modified = true;
            }
            if (modified) {
                await user.save();
            }
        }

        const payload = {
            email: user.email,
            id: user._id,
            role: user.role || "User"
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };

        return res.cookie("token", token, options).status(200).json({
            success: true,
            message: "Login from Google successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                role: user.role || "User",
                token: token
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error logging from Google: " + error.message
        });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie("token", { 
        httpOnly: true, 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
        secure: process.env.NODE_ENV === "production"
    });
    res.json({ 
        message: "Logged out" 
    });
};
