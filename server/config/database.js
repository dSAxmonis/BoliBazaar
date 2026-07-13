const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("MONGODB Connected");
    }
    catch(error){
        console.log("ERROR IN MONGODB CONNECTION: ", error);
        process.exit(1);
    }
}

module.exports = connectDB;