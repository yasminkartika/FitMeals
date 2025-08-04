const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");

// Middleware untuk verifikasi admin
async function verifyAdmin(req, res, next) {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.substring(7); // Hapus "Bearer " dari token

    // Untuk implementasi sederhana, kita bisa decode token manual
    // Dalam produksi, gunakan JWT library
    const tokenParts = token.split('_');
    if (tokenParts.length < 3 || tokenParts[0] !== 'admin') {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    const userId = tokenParts[1];
    
    await dbConnect();
    
    // Cari user berdasarkan ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    // Verifikasi role admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak. Role tidak sesuai." });
    }

    // Tambahkan user ke request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

// Middleware untuk verifikasi admin dari localStorage (untuk frontend)
function verifyAdminFromStorage() {
  return (req, res, next) => {
    try {
      const user = JSON.parse(req.headers['x-user-data'] || '{}');
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Akses ditolak. Anda bukan admin." });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Data user tidak valid" });
    }
  };
}

// GET /api/admin/profile - untuk mengambil data profil admin
async function getAdminProfile(req, res) {
  try {
    await dbConnect();
    
    // req.user sudah diset oleh verifyAdmin middleware
    const admin = await User.findById(req.user._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }
    
    res.json({
      _id: admin._id,
      namaLengkap: admin.namaLengkap,
      email: admin.email,
      username: admin.username,
      nomorHP: admin.nomorHP,
      role: admin.role,
      tanggalLahir: admin.tanggalLahir,
      alamat: admin.alamat,
      fotoProfil: admin.fotoProfil,
      createdAt: admin.createdAt
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Gagal mengambil data profil admin", error: error.message });
  }
}

module.exports = {
  verifyAdmin,
  verifyAdminFromStorage,
  getAdminProfile
}; 