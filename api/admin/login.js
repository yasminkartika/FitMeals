const dbConnect = require("../../config/database.js");
const User = require("../../models/User.js");
const bcrypt = require("bcryptjs");

module.exports = async function loginHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  // Validasi input dasar
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    // Koneksi ke database
    await dbConnect();
    console.log("Database connected successfully");

    // Cari user berdasarkan email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User search result:", user ? "User found" : "User not found");

    if (!user) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
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
