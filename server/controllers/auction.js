const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

exports.createAuction = async (req, res) => {
    try{
        const { title, description, category, tag, startingPrice, auctionDate } = req.body;
        
        const seller = req.user.id;

        if(!title || !description || !category || !startingPrice || !auctionDate){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const endTime = new Date(auctionDate);

        if (isNaN(endTime.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid auction end time format"
            });
        }

        if (endTime <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Auction end time must be in the future"
            });
        }

        // Check if the category is valid
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found",
            });
        }

        // Handle image upload to Cloudinary
        let imageData = null;
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

        const newProduct = new Product({
            title,
            description,
            category: category,
            tag: tag ? tag.split(",") : [],
            images: imageData,
            seller:seller,
            startingPrice,
            auctionEndTime:endTime
        });

        await newProduct.save();

        //add auction to user
        await User.findByIdAndUpdate(
            { _id:  seller },
            { $push: { products:  newProduct._id } },
            { new: true }
        );

        //add auction to category
        await Category.findByIdAndUpdate(
            { _id: categoryDetails._id },
            { $push: { products: newProduct._id } },
            { new: true }
        );

        return res.status(200).json({
            success:true,
            message:"Product Auctioned Successfully and is Live",
            product:newProduct
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating an auction"
        })
    }
}

//fetch all user auctions
exports.fetchAllUserAuctions = async (req, res) => {
    try{    
        const userId = req.user.id;
        
        const auctions = await Product.find({ seller: userId })
            .select("title description images startingPrice currentBid auctionEndTime status")
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success:true,
            message:"All auctions fetched",
            auctions
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching auctions"
        })
    }
}

exports.deleteAuction = async (req, res) => {
    try{
        const { auctionId } = req.params;
        const userId = req.user.id;

        const auction = await Product.findById(auctionId);
        if(!auction){
            return res.status(404).json({
                success:false,
                message:"Auction not found"
            })
        }

        // remove from category schema too
        await Category.updateMany(
            { products: auctionId },
            { $pull: { products: auctionId } }
        );

        // remove from user schema too
        await User.updateMany(
            { products: auctionId },
            { $pull: { products: auctionId } }
        );

        if(auction.seller.toString() !== userId.toString()){
            return res.status(403).json({
                success:false,
                message:"Not Authenticated to delete auction"
            });
        }

        // Delete image from Cloudinary if it exists
        if (auction.images && auction.images.public_id) {
            try {
                await deleteFromCloudinary(auction.images.public_id);
            } catch (err) {
                console.error("Error deleting image from Cloudinary:", err);
            }
        }

        await Product.findByIdAndDelete(auctionId);

        return res.status(200).json({
            success: true,
            message: "Auction deleted successfully",
        });
    }
    catch(error){
        console.error("Error deleting auction:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the auction",
        });
    }
}

// Edit auction controller
exports.editAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;
        const { title, description, category, tag, startingPrice, auctionEndTime } = req.body;
        let updateFields = { title, description, category, tag, startingPrice, auctionEndTime };

        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] === undefined) delete updateFields[key];
        });

        // Find auction
        const auction = await Product.findById(auctionId);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found"
            });
        }
        if (auction.seller.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to edit this auction"
            });
        }

        // Handle image update if provided
        if (req.file) {
            
            if (auction.images && auction.images.public_id) {
                try {
                    await deleteFromCloudinary(auction.images.public_id);
                } catch (err) {
                    console.error("Error deleting old image from Cloudinary:", err);
                }
            }
            // Upload new image
            try {
                updateFields.images = await uploadToCloudinary(req.file);
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload new image to Cloudinary"
                });
            }
        }

        // Update auction
        const updatedAuction = await Product.findByIdAndUpdate(
            auctionId,
            { $set: updateFields },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Auction updated successfully",
            auction: updatedAuction
        });
    } catch (error) {
        console.error("Error editing auction:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the auction"
        });
    }
};

// Fetch all live auctions to display
exports.fetchAuctions = async (req, res) => {
    try {
        const auctions = await Product.find({ status: "Live" })
            .populate("category", "name")
            .populate("seller", "firstName lastName");

        if (!auctions || auctions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Live Auctions Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Live auctions returned successfully",
            auctions
        });
    } catch (error) {
        console.error("Error fetching auctions:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the auctions",
        });
    }
};

// Fetch top 3 newest auctions for featured section
exports.fetchFeaturedAuctions = async (req, res) => {
    try {
        const featured = await Product.find({ status: "Live" })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("category", "name")
            .populate("seller", "firstName lastName image");

        return res.status(200).json({
            success: true,
            message: "Featured auctions fetched successfully",
            featured
        });
    } catch (error) {
        console.error("Error fetching featured auctions:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching featured auctions",
        });
    }
};

//fetch specific auction
exports.fetchSpecificAuction = async (req, res) => {
    try{
        const {auctionId} = req.query;

        if(!auctionId){
            return res.status(404).json({
                success:false,
                message:"No Auction Id"
            })
        }

        const auctionDetails = await Product.findById({_id:auctionId})
            .populate("seller", "firstName lastName image")
            .populate("category", "name description")
            .populate({
                path: "bids",
                populate: {
                    path: "bidder",
                    select: "firstName lastName image"
                }
            })
            .exec();
        
        if(!auctionDetails){
            return res.status(400).json({
                success:false,
                message:"Could not find the Auction Details"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Auction Details fetched successfully",
            auctionDetails,
        })
    }
    catch(error){
        console.error("Error fetching auction Details:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the auction Details",
        });
    }
}
