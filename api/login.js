const dbConnect = require("../lib/db.js");
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  // Validasi input dasar
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

    // Kalau berhasil, kirim data user (tanpa password)
    const { password: _, ...userData } = user._doc;
    
    // Simpan ke session dengan data yang lebih lengkap
    req.session.user = {
      id: user._id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      email: user.email,
      role: user.role || 'user',
      loginTime: new Date().toISOString()
    };

    // Regenerate session ID untuk keamanan
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
      }
      
      // Generate token yang lebih aman
      const token = crypto.randomBytes(32).toString('hex');
      
      // Simpan token di session juga
      req.session.token = token;
      
      return res.status(200).json({
        message: "Login berhasil",
        user: userData,
        token: token,
      });
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

module.exports = handler;
