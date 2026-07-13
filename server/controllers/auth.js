const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

exports.signup = async (req, res) => {
    try{
        const {firstName, lastName, email, password, confirmPassword, role} = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not match"
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already registered"
            })
        };

        //hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        //check for image
        let imageData = {
            url: `https://api.dicebear.com/8.x/initials/svg?seed=${firstName} ${lastName}`,
            public_id: null
        };

        if(req.file){
            try {
                imageData = await uploadToCloudinary(req.file);
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload image to Cloudinary"
                });
            }
        }

        //create entry in DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            image:imageData,
            role,
        });

        return res.status(200).json({
            success:true,
            message:"User registered successfully",
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in Signup"
        })
    }
}

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        //check if user exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not registered"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Invalid credentials"
            });
        }

        //generate jwt token
        const payload = {
            email:user.email,
            id:user._id,
            role:user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn:"24h"
        });

        //send cookie
        res.cookie("token", token, {
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge: 24*60*60*1000,
        });

        return res.status(200).json({
            success:true,
            message:"User logged in successfully",
            user:{
                id:user._id,
                name: user.firstName,
                email: user.email,
                image: user.image
            }
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in Login"
        })
    }
}

exports.googleLogin = async (req, res) => {
    try{
        const { uid, firstName, lastName, email, imageUrl } = req.body;

        let user = await User.findOne({ uid });

        if(!user){
            user = new User({
                uid,
                firstName,
                lastName,
                email,
                image:{
                    url:imageUrl,
                    public_url:null
                }
            });

            await user.save();
        }

        const payload = {
            email: user.email,
            id:user._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn:"24h",
        });

        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
            secure:true,
            sameSite:"none"
        }

        return res.cookie("token", token, options).status(200).json({
            success:true,
            message:"Login from Google successful",
            token,
            user
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error logging from Google"
        });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie("token", { 
        httpOnly: true, 
        sameSite: "Strict", 
        secure: true 
    });
    res.json({ 
        message: "Logged out" 
    });
}
