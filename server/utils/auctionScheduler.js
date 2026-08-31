const cron = require('node-cron');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Notification = require('../models/Notifications');
const { getIo, getConnectedUsers } = require('../socket/socket');

// cron scheduler running every minute
cron.schedule("* * * * *", async () => {
    try {
        const expiredAuctions = await Product.find({
            status: "Live",
            auctionEndTime: { $lte: new Date() }
        }).populate({
            path: "bids",
            populate: {
                path: "bidder",
                select: "firstName lastName email"
            }
        }).populate("seller", "firstName lastName email");

        const io = getIo();
        const connectedUsers = getConnectedUsers();

        for (let auction of expiredAuctions) {
            let highestBid = null;

            if (auction.bids.length > 0) {
                highestBid = auction.bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max), auction.bids[0]);
            }

            if (highestBid && highestBid.bidder) {
                // An auction with bids is Sold
                auction.status = "Sold";
                auction.winner = highestBid.bidder._id;
                
                // Add to winner's winnings list
                await User.findByIdAndUpdate(highestBid.bidder._id, { $push: { winnings: auction._id } });

                const winnerName = `${highestBid.bidder.firstName} ${highestBid.bidder.lastName}`;
                const sellerName = auction.seller ? `${auction.seller.firstName} ${auction.seller.lastName}` : "Unknown Seller";

                // Create DB Notification for Winner
                const winnerMessage = `Congratulations! You won the auction for "${auction.title}" with a bid of ₹${highestBid.amount}.`;
                await Notification.create({
                    userId: highestBid.bidder._id,
                    message: winnerMessage
                });

                // Create DB Notification for Seller
                if (auction.seller) {
                    const sellerMessage = `Your auction for "${auction.title}" has been sold to ${winnerName} for ₹${highestBid.amount}.`;
                    await Notification.create({
                        userId: auction.seller._id,
                        message: sellerMessage
                    });

                    // Real-time notifications via socket
                    if (io) {
                        const sellerSocketId = connectedUsers[auction.seller._id.toString()];
                        if (sellerSocketId) {
                            io.to(sellerSocketId).emit("bidNotification", {
                                productId: auction._id,
                                message: sellerMessage,
                                timestamp: new Date()
                            });
                        }
                    }
                }

                // Real-time notification for winner
                if (io) {
                    const winnerSocketId = connectedUsers[highestBid.bidder._id.toString()];
                    if (winnerSocketId) {
                        io.to(winnerSocketId).emit("bidNotification", {
                            productId: auction._id,
                            message: winnerMessage,
                            timestamp: new Date()
                        });
                    }
                }
            } else {
                // No bids or bidder deleted - auction is Expired
                auction.status = "Expired";

                // Create DB Notification for Seller
                if (auction.seller) {
                    const expiredMessage = `Your auction for "${auction.title}" has expired with no bids.`;
                    await Notification.create({
                        userId: auction.seller._id,
                        message: expiredMessage
                    });

                    // Real-time socket notification
                    if (io) {
                        const sellerSocketId = connectedUsers[auction.seller._id.toString()];
                        if (sellerSocketId) {
                            io.to(sellerSocketId).emit("bidNotification", {
                                productId: auction._id,
                                message: expiredMessage,
                                timestamp: new Date()
                            });
                        }
                    }
                }
            }

            await auction.save();

            // Broadcast general auction status update
            if (io) {
                io.emit("auctionEnded", {
                    productId: auction._id,
                    status: auction.status,
                    winner: auction.winner || null,
                    finalPrice: highestBid ? highestBid.amount : auction.startingPrice
                });
            }
        }
    } catch (error) {
        console.error("Error updating expired auctions scheduler:", error);
    }
});