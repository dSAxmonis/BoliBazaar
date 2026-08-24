const Bid = require("../models/Bid.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const Notification = require("../models/Notifications.js");
const { getIo, getConnectedUsers } = require("../socket/socket.js");

exports.placeBid = async (req, res) => {
  try {
    const { productId, bidAmount } = req.body;
    const bidderId = req.user.id;

    if (!productId || !bidAmount) {
      return res.status(400).json({ success: false, message: "Product ID and amount are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if the auction has already ended
    if (new Date(product.auctionEndTime) <= new Date() || product.status !== "Live") {
      return res.status(400).json({ success: false, message: "This auction has ended" });
    }

    // Check if the bidder is the seller
    if (product.seller.toString() === bidderId) {
      return res.status(400).json({ success: false, message: "You cannot bid on your own product" });
    }

    const highestBid = await Bid.findOne({ product: productId }).sort({ amount: -1 });

    // Validate that bid is higher than current highest bid AND >= starting price
    const minPrice = highestBid ? highestBid.amount : product.startingPrice;
    if (bidAmount <= minPrice) {
      return res.status(400).json({
        success: false,
        message: highestBid
          ? `Your bid must be higher than the current highest bid of ₹${highestBid.amount}`
          : `Your bid must be at least the starting price of ₹${product.startingPrice}`
      });
    }

    // Fetch user details for notification
    const bidder = await User.findById(bidderId);
    const bidderName = `${bidder.firstName} ${bidder.lastName}`;

    // Create new bid
    const newBid = await Bid.create({
      product: productId,
      bidder: bidderId,
      amount: bidAmount
    });

    // Update product's bids and currentBid atomically to prevent concurrency conflicts
    const updatedProduct = await Product.findOneAndUpdate(
      { 
        _id: productId,
        currentBid: product.currentBid 
      },
      {
        $push: { bids: newBid._id },
        $set: { currentBid: bidAmount }
      },
      { new: true }
    );

    if (!updatedProduct) {
      // Rollback the created bid to maintain data integrity
      await Bid.findByIdAndDelete(newBid._id);
      return res.status(409).json({
        success: false,
        message: "Another user placed a bid just now. Please try again."
      });
    }

    // Update user's bids array
    await User.findByIdAndUpdate(bidderId, { $push: { bids: newBid._id } });

    const io = getIo();
    const connectedUsers = getConnectedUsers();

    // Notify seller
    const sellerMessage = `New bid of ₹${bidAmount} placed on your product "${product.title}" by ${bidderName}`;
    await Notification.create({
      userId: product.seller,
      message: sellerMessage
    });

    if (io) {
      const sellerSocketId = connectedUsers[product.seller.toString()];
      if (sellerSocketId) {
        io.to(sellerSocketId).emit("bidNotification", {
          productId,
          bidAmount,
          bidderEmail: bidder.email,
          message: sellerMessage,
          timestamp: new Date()
        });
      }
    }

    // Notify previous highest bidder if they exist and are not the current bidder
    if (highestBid && highestBid.bidder.toString() !== bidderId) {
      const outbidMessage = `You have been outbid on "${product.title}". The new highest bid is ₹${bidAmount}.`;
      await Notification.create({
        userId: highestBid.bidder,
        message: outbidMessage
      });

      if (io) {
        const outbidSocketId = connectedUsers[highestBid.bidder.toString()];
        if (outbidSocketId) {
          io.to(outbidSocketId).emit("bidNotification", {
            productId,
            bidAmount,
            message: outbidMessage,
            timestamp: new Date()
          });
        }
      }
    }

    // Emit live update to all users watching or viewing this product
    if (io) {
      io.emit("productUpdate", {
        productId,
        currentBid: bidAmount,
        totalBids: product.bids.length
      });
    }

    return res.status(201).json({ success: true, message: "Bid placed successfully", bid: newBid });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.editBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { bidAmount } = req.body;

    if (!bidAmount) {
      return res.status(400).json({ success: false, message: "Bid amount is required" });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    // Ensure only the bidder can edit their bid
    if (bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only edit your own bids" });
    }

    const product = await Product.findById(bid.product);
    if (!product || new Date(product.auctionEndTime) <= new Date() || product.status !== "Live") {
      return res.status(400).json({ success: false, message: "Cannot edit bid on an ended/inactive auction" });
    }

    // Check if new amount is higher than current highest bid
    const highestBid = await Bid.findOne({ product: bid.product }).sort({ amount: -1 });
    if (highestBid && bidAmount <= highestBid.amount && highestBid._id.toString() !== bidId) {
      return res.status(400).json({ success: false, message: `Your new bid must be higher than the highest bid of ₹${highestBid.amount}` });
    }

    if (bidAmount < product.startingPrice) {
      return res.status(400).json({ success: false, message: `Your bid must be at least the starting price of ₹${product.startingPrice}` });
    }

    // Update bid amount
    bid.amount = bidAmount;
    await bid.save();

    // Update product's currentBid if this is the highest bid
    const newHighestBid = await Bid.findOne({ product: bid.product }).sort({ amount: -1 });
    product.currentBid = newHighestBid ? newHighestBid.amount : 0;
    await product.save();

    const io = getIo();
    if (io) {
      io.emit("productUpdate", {
        productId: product._id,
        currentBid: product.currentBid,
        totalBids: product.bids.length
      });
    }

    return res.status(200).json({ success: true, message: "Bid updated successfully", bid });
  } catch (error) {
    console.error("Error editing bid:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    // Ensure only the bidder can delete their bid
    if (bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own bids" });
    }

    const product = await Product.findById(bid.product);
    if (!product || new Date(product.auctionEndTime) <= new Date() || product.status !== "Live") {
      return res.status(400).json({ success: false, message: "Cannot delete bid on an ended/inactive auction" });
    }

    // Remove from Product's bids array
    await Product.findByIdAndUpdate(bid.product, { $pull: { bids: bid._id } });

    // Remove from User's bids array
    await User.findByIdAndUpdate(bid.bidder, { $pull: { bids: bid._id } });

    // Delete the bid
    await bid.deleteOne();

    // Update product's currentBid after deletion
    const highestBid = await Bid.findOne({ product: bid.product }).sort({ amount: -1 });
    product.currentBid = highestBid ? highestBid.amount : 0;
    await product.save();

    const io = getIo();
    if (io) {
      io.emit("productUpdate", {
        productId: product._id,
        currentBid: product.currentBid,
        totalBids: product.bids.length
      });
    }

    return res.status(200).json({ success: true, message: "Bid deleted successfully" });
  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
