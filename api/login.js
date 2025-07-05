const dbConnect = require("../lib/db.js");
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fitmeals_secret";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  try {
    await dbConnect();

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    const { password: _, ...userData } = user._doc;

    // Buat JWT
    const payload = {
      id: user._id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      email: user.email,
      nomorHP: user.nomorHP,
      role: user.role || "user",
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login berhasil",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

module.exports = handler;
