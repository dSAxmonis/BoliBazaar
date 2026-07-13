const User = require("../models/User");
const Product = require("../models/Product");
const Bid = require("../models/Bid");

exports.topSellers = async (req, res) => {
    try {
        const topSellers = await User.aggregate([
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    image:1,
                    productCount: { $size: "$products" },
                },
            },
            { $sort: { productCount: -1 } },
        ]);

        if (!topSellers.length) {
            return res.status(404).json({
                success: false,
                message: "No Top Sellers Yet",
            });
        }

        return res.status(200).json({
            success: true,
            message:"Top Sellers Returned",
            topSellers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get Top Buyers
exports.topBuyers = async (req, res) => {
    try {
        const topBuyers = await User.aggregate([
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    purchaseCount: { $size: "$winnings" },
                },
            },
            { $match: { purchaseCount: { $gt: 0 } } },
            { $sort: { purchaseCount: -1 } },
        ]);

        if (!topBuyers.length) {
            return res.status(404).json({
                success: false,
                message: "No Top Buyers Yet",
            });
        }

        return res.status(200).json({
            success: true,
            message:"Top Buyers Returned",
            topBuyers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get User Profile Data
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId)
            .populate('products')
            .populate('winnings')
            .populate('bids')
            .populate('watchList');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Get user statistics
        const totalAuctions = user.products.length;
        const totalWinnings = user.winnings.length;
        const totalBids = user.bids.length;
        const watchListCount = user.watchList.length;

        // Get active auctions
        const activeAuctions = user.products.filter(product => 
            product.status === "Live" && new Date(product.auctionEndTime) > new Date()
        );

        // Get completed auctions
        const completedAuctions = user.products.filter(product => 
            product.status === "Sold" || new Date(product.auctionEndTime) <= new Date()
        );

        // Calculate total value of winnings
        const totalWinningsValue = user.winnings.reduce((sum, product) => 
            sum + (product.finalPrice || product.startingPrice || 0), 0
        );

        // Get recent activity (last 10 activities)
        const recentBids = await Bid.find({ bidder: userId })
            .populate('product')
            .sort({ createdAt: -1 })
            .limit(10);

        const profileData = {
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt
            },
            statistics: {
                totalAuctions,
                activeAuctions: activeAuctions.length,
                completedAuctions: completedAuctions.length,
                totalWinnings,
                totalBids,
                watchListCount,
                totalWinningsValue
            },
            recentActivity: recentBids
        };

        return res.status(200).json({
            success: true,
            message: "User profile data retrieved successfully",
            data: profileData
        });
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get User Activity History
exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = "all", limit = 20 } = req.query;

        let history = [];

        if (type === "all" || type === "created") {
            const createdAuctions = await Product.find({ seller: userId })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));
            
            history.push(...createdAuctions.map(auction => ({
                id: auction._id,
                type: "created",
                title: auction.title,
                amount: auction.startingPrice,
                date: auction.createdAt,
                status: auction.status,
                image: auction.images?.url || null
            })));
        }

        if (type === "all" || type === "won") {
            const user = await User.findById(userId).populate('winnings');
            const wonItems = user.winnings.map(item => ({
                id: item._id,
                type: "won",
                title: item.title,
                amount: item.finalPrice || item.startingPrice,
                date: item.updatedAt,
                status: "completed",
                image: item.images?.url || null
            }));
            history.push(...wonItems);
        }

        if (type === "all" || type === "bid") {
            const userBids = await Bid.find({ bidder: userId })
                .populate('product')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            const bidHistory = userBids.map(bid => ({
                id: bid._id,
                type: "bid",
                title: bid.product.title,
                amount: bid.amount,
                date: bid.createdAt,
                status: bid.product.status === "Sold" ? "completed" : "active",
                image: bid.product.images?.url || null
            }));
            history.push(...bidHistory);
        }

        // Sort by date (newest first)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            success: true,
            message: "User history retrieved successfully",
            history: history.slice(0, parseInt(limit))
        });
    } catch (error) {
        console.error("Error in getUserHistory:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get User Winnings
exports.getUserWinnings = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('winnings');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const winnings = user.winnings.map(item => ({
            id: item._id,
            title: item.title,
            description: item.description,
            finalPrice: item.finalPrice || item.startingPrice,
            originalPrice: item.startingPrice,
            wonDate: item.updatedAt,
            seller: item.seller,
            image: item.images?.url || null,
            category: item.category
        }));

        const totalValue = winnings.reduce((sum, item) => sum + item.finalPrice, 0);
        const totalSavings = winnings.reduce((sum, item) => sum + (item.originalPrice - item.finalPrice), 0);

        return res.status(200).json({
            success: true,
            message: "User winnings retrieved successfully",
            winnings,
            statistics: {
                totalItems: winnings.length,
                totalValue,
                totalSavings,
                averageSavings: winnings.length > 0 ? Math.round(totalSavings / winnings.length) : 0
            }
        });
    } catch (error) {
        console.error("Error in getUserWinnings:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all bids placed by the user
    await Bid.deleteMany({ bidder: userId });

    // Optionally delete all products listed by the user
    await Product.deleteMany({ seller: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({success:true, message: "User account deleted permanently" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Server error" });
  }
};


