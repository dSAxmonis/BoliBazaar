// One-time script to populate categories so the Create Auction dropdown
// isn't empty. Run with: node utils/seedCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  { name: "Art & Collectibles", description: "Paintings, sculptures, rare collectibles" },
  { name: "Jewelry & Watches", description: "Fine jewelry, luxury watches" },
  { name: "Vehicles", description: "Cars, bikes, and other vehicles" },
  { name: "Real Estate", description: "Properties and land" },
  { name: "Fashion", description: "Clothing, bags, accessories" },
  { name: "Electronics", description: "Gadgets, computers, and devices" },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");

  for (const cat of categories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Skipped (already exists): ${cat.name}`);
    }
  }

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
