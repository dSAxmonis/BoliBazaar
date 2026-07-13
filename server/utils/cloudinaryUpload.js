const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for memory storage (no local file saving)
const storage = multer.memoryStorage();

// Filter for image only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only Images (jpeg, jpg, png, gif) are allowed!"), false);
    }
};

// Initialize multer for memory storage
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max size
    },
});

// Function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: process.env.FOLDER_NAME,
            resource_type: 'auto',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
            ]
        });
        
        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

// Function to delete image from Cloudinary
const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return;
        
        const result = await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};

module.exports = {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary
};
