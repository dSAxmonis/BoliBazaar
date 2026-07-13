const cron = require('node-cron');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const User = require('../models/User');

//scheduling
cron.schedule("* * * * *", async () => {

    try{
        const expiredAuctions = await Product.find({
            status:"Live",
            auctionEndTime:{ $lte: new Date() }
        }).populate("bids");

        for (let auction of expiredAuctions){
            let highestBid = null;

            if(auction.bids.length > 0){
                highestBid = auction.bids.reduce((max, bid) => (bid.bidAmount > max.bidAmount ? bid : max), auction.bids[0]);
            }

            //update auction status
            auction.status = "Expired";
            if(highestBid){
                auction.winner = highestBid.user;
                await User.findByIdAndUpdate(highestBid.user, { $push: { winnings: auction._id } });
            }

            await auction.save();
            //console.log(`Auction ${auction.title} has ended. Winner: ${highestBid ? highestBid.user : "No Winner"}`);
        }
    }

    catch(error){
        console.log("Error updating expired auctions", error);
    }
})