const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const dbConnect = async () => {
  if (mongoose.connections[0].readyState) {
    return; // sudah terhubung
  }

  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fitmeals",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal konek DB:", error);
    throw error;
  }
};

module.exports = dbConnect;
console.log("MONGODB_URI:", MONGODB_URI);
