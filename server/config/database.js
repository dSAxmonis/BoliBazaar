const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MONGODB Connected");

        // Seed default categories if empty
        const count = await Category.countDocuments();
        if (count === 0) {
            const defaultCategories = [
                { name: "Art & Collectibles", description: "Paintings, sculptures, rare collectibles" },
                { name: "Jewelry & Watches", description: "Fine jewelry, luxury watches" },
                { name: "Vehicles", description: "Cars, bikes, and other vehicles" },
                { name: "Real Estate", description: "Properties and land" },
                { name: "Fashion", description: "Clothing, bags, accessories" },
                { name: "Electronics", description: "Gadgets, computers, and devices" },
                { name: "Gaming", description: "Gaming gear, consoles, accounts" },
                { name: "Antiques", description: "Vintage and retro items" }
            ];
            await Category.insertMany(defaultCategories);
            console.log("Database seeded with default categories.");
        }
    }
    catch(error){
        console.log("ERROR IN MONGODB CONNECTION: ", error);
    }
}

module.exports = connectDB;