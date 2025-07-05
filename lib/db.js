const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const dbConnect = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("✅ Using existing database connection");
    return; // sudah terhubung
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal konek DB:", error);
    throw error;
  }
};

module.exports = dbConnect;
