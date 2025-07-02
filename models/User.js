const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  namaLengkap: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  nomorHP: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

// Cegah error recompile model di serverless function
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
