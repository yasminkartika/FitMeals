// Database Configuration
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fitmeals";

let isConnected = false;

async function dbConnect() {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("✅ MongoDB Connected to:", MONGODB_URI);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("MongoDB connection failed");
  }
}

module.exports = dbConnect; 