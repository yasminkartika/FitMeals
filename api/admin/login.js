const dbConnect = require("../../config/database.js");
const User = require("../../models/User.js");
const bcrypt = require("bcryptjs");

module.exports = async function loginHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { identifier, password } = req.body;

  // Validasi input dasar
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Username/email dan password wajib diisi" });
  }

  try {
    // Koneksi ke database
    await dbConnect();
    console.log("Database connected successfully");

    // Cek apakah identifier mengandung '@' (email) atau tidak (username)
    let user;
    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() });
    }
    console.log("User search result:", user ? "User found" : "User not found");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Username/email tidak ditemukan" });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Cek apakah user memiliki role admin
    console.log("User role:", user.role);
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak. Anda tidak memiliki hak akses admin.",
      });
    }

    // Kalau berhasil, kirim data user (tanpa password)
    const { password: _, ...userData } = user._doc;

    const token = generateAdminToken(userData);
    console.log("Generated token:", token);

    // ✅ Tambahkan penyimpanan session admin di sini
    req.session.admin = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    console.log("Session admin disimpan:", req.session.admin);
    
    // Pastikan session disimpan
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      } else {
        console.log("Session admin berhasil disimpan");
      }
    });

    return res.status(200).json({
      message: "Login admin berhasil",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

// Fungsi untuk generate token admin
function generateAdminToken(userData) {
  return `admin_${userData._id}_${Date.now()}`;
}
