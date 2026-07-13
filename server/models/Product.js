const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    tag:{
        type:[String],
    },
    images:{
        url: {
            type: String,
            default: null
        },
        public_id: {
            type: String,
            default: null
        }
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    startingPrice:{
        type:Number,
        required:true
    },
    currentBid:{
        type:Number,
        default:0
    },
    //optional
    buyNowPrice:{
        type:Number
    },
    bids:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Bid"
        }
    ],
    auctionEndTime:{
        type:Date,
        required:true
    },
    winner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["Live", "Sold", "Expired"],
        default:"Live"
    }
}, {timestamps:true});

module.exports = mongoose.model("Product", productSchema);