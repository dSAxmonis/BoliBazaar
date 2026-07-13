const Bid = require("../models/Bid.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");

exports.placeBid = async (req, res) => {
  try {
    const { productId, bidAmount } = req.body;

    if (!productId || !bidAmount) {
      return res.status(400).json({ message: "Product ID and amount are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const highestBid = await Bid.findOne({ product: productId }).sort({ amount: -1 });
    if (highestBid && bidAmount <= highestBid.amount) {
      return res.status(400).json({ message: `Your bid must be higher than ${highestBid.amount}` });
    }

    // Create new bid
    const newBid = await Bid.create({
      product: productId,
      bidder: req.user.id,
      amount: bidAmount
    });

    // Update product's bids and currentBid
    product.bids.push(newBid._id);
    product.currentBid = bidAmount;
    await product.save();

    // Update user's bids array
    await User.findByIdAndUpdate(req.user.id, { $push: { bids: newBid._id } });

    return res.status(201).json({ success:true, message: "Bid placed successfully", bid: newBid });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { bidAmount } = req.body;

    if (!bidAmount) {
      return res.status(400).json({ message: "Bid amount is required" });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Ensure only the bidder can edit their bid
    if (bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own bids" });
    }

    // Check if new amount is higher than current highest bid
    const highestBid = await Bid.findOne({ product: bid.product }).sort({ amount: -1 });
    if (highestBid && bidAmount <= highestBid.amount && highestBid._id.toString() !== bidId) {
      return res.status(400).json({ message: `Your new bid must be higher than ${highestBid.amount}` });
    }

    // Update bid amount
    bid.amount = bidAmount;
    await bid.save();

    // Update product's currentBid if this is the highest bid
    const product = await Product.findById(bid.product);
    const newHighestBid = await Bid.findOne({ product: bid.product }).sort({ amount: -1 });
    product.currentBid = newHighestBid ? newHighestBid.amount : 0;
    await product.save();

    return res.status(200).json({success:true, message: "Bid updated successfully", bid });
  } catch (error) {
    console.error("Error editing bid:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Ensure only the bidder can delete their bid
    if (bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own bids" });
    }

    // Remove from Product's bids array
    await Product.findByIdAndUpdate(bid.product, { $pull: { bids: bid._id } });

    // Remove from User's bids array
    await User.findByIdAndUpdate(bid.bidder, { $pull: { bids: bid._id } });

    // Delete the bid
    await bid.deleteOne();

    // Update product's currentBid after deletion
    const product = await Product.findById(bid.product);
    const highestBid = await Bid.findOne({ product: bid.product }).sort({ amount: -1 });
    product.currentBid = highestBid ? highestBid.amount : 0;
    await product.save();

    return res.status(200).json({success:true, message: "Bid deleted successfully" });
  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ message: "Server error" });
  }
};
