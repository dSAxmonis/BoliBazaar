const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MONGODB Connected");
    }
    catch(error){
        console.log("ERROR IN MONGODB CONNECTION: ", error);
        // Don't kill the whole process on a transient connection error -
        // that takes the entire server down for every user over one bad
        // connection attempt. Log it and let individual requests fail
        // instead, so the server can recover on retry.
    }
}

module.exports = connectDB;