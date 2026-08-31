const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { cacheSet, cacheGet, cacheDel } = require('../config/redis');
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
        await cacheSet(verifyKey, dataToStore, { EX: 300 });

        const subject = "Verify your email address - BoliBazaar";
        const emailHtml = verifyEmailHtml({ email, token: verifyToken });

        try {
            await sendEmail(email, subject, emailHtml);
            return res.status(201).json({
                success: true,
                message: "Registration successful. Please verify your email."
            });
        } catch (mailError) {
            console.error("[signup] Email delivery failed, providing fallback:", mailError);
            const fallbackLink = `/token/${encodeURIComponent(verifyToken)}`;
            return res.status(201).json({
                success: true,
                message: `Registered! (Local fallback path: ${fallbackLink})`,
                link: fallbackLink
            });
        }
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
        const userDataJson = await cacheGet(verifyKey);

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

        await cacheDel(verifyKey);

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

        if (!user.password) {
            // Generate OTP for creating password
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpKey = `create-password-otp:${email}`;

            // Store OTP in Redis for 5 minutes
            await cacheSet(otpKey, JSON.stringify(otp), { EX: 300 });

            const subject = "OTP for Creating Account Password - BoliBazaar";
            const otpHtml = `
                <h1>Create Password for your BoliBazaar Account</h1>
                <p>You registered this account using Google. To log in manually with email/password, you must set a password.</p>
                <p>Your verification OTP is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 5 minutes.</p>
            `;

            try {
                await sendEmail(email, subject, otpHtml);
                return res.status(200).json({
                    success: true,
                    isGoogleAccountWithoutPassword: true,
                    email,
                    message: "A password creation OTP has been sent to your email."
                });
            } catch (mailError) {
                console.error("[login] Create password OTP email delivery failed, providing fallback:", mailError);
                return res.status(200).json({
                    success: true,
                    isGoogleAccountWithoutPassword: true,
                    email,
                    message: `A password creation OTP has been sent (Mock OTP fallback: ${otp})`,
                    otp
                });
            }
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
        await cacheSet(otpKey, JSON.stringify(otp), { EX: 300 });

        const subject = "OTP for Login Verification - BoliBazaar";
        const otpHtml = getOtpHtml({ email, otp });

        try {
            await sendEmail(email, subject, otpHtml);
            return res.status(200).json({
                success: true,
                message: "An OTP has been sent to your email"
            });
        } catch (mailError) {
            console.error("[login] OTP email delivery failed, providing fallback:", mailError);
            return res.status(200).json({
                success: true,
                message: `An OTP has been sent (Mock OTP fallback: ${otp})`,
                otp
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in Login: " + error.message
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
        const storedOtpString = await cacheGet(otpKey);

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
        await cacheDel(otpKey);

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
        const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "deployement";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
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



exports.logout = async (req, res) => {
    const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "deployement";
    res.clearCookie("token", { 
        httpOnly: true, 
        sameSite: isProduction ? "none" : "lax", 
        secure: isProduction
    });
    res.json({ 
        message: "Logged out" 
    });
};

exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                role: user.role || "User"
            }
        });
    } catch (error) {
        console.error("Error fetching user session:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.googleCallback = (req, res) => {
    try {
        const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        const payload = {
            email: req.user.email,
            id: req.user._id,
            role: req.user.role || "User"
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "deployement";
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        };

        res.cookie('token', token, options);

        const user = {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            image: req.user.image,
            role: req.user.role || "User",
            token: token
        };

        res.send(`
            <script>
                if (window.opener) {
                    window.opener.postMessage({ 
                        type: 'GOOGLE_AUTH_SUCCESS', 
                        token: '${token}', 
                        user: ${JSON.stringify(user)} 
                    }, '${CLIENT_URL}');
                    window.close();
                } else {
                    window.location.href = '${CLIENT_URL}/dashboard/my-profile';
                }
            </script>
        `);
    } catch (error) {
        console.error("Error in googleCallback:", error);
        const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${CLIENT_URL}/login?error=auth_error`);
    }
};

exports.createPassword = async (req, res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;

        if (!email || !otp || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Validate OTP from Redis
        const otpKey = `create-password-otp:${email}`;
        const storedOtpJson = await cacheGet(otpKey);
        
        if (!storedOtpJson) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired or is invalid"
            });
        }

        const storedOtp = JSON.parse(storedOtpJson);
        if (storedOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete OTP from Redis
        await cacheDel(otpKey);

        return res.status(200).json({
            success: true,
            message: "Password created successfully. You can now log in manually."
        });
    } catch (error) {
        console.error("Error in createPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message
        });
    }
};
