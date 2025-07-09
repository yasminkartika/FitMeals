const dbConnect = require("../../config/database.js");
const Order = require("../../models/Order.js");
const User = require("../../models/User.js");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    // Verifikasi admin secara manual
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.substring(7);
    const tokenParts = token.split('_');
    if (tokenParts.length < 3 || tokenParts[0] !== 'admin') {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    const userId = tokenParts[1];
    const timestamp = tokenParts[2];

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ message: "Token telah kadaluarsa" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak. Anda bukan admin." });
    }

    // Ambil semua pesanan
    const orders = await Order.find({}).populate('userId', 'namaLengkap email');
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ message: "Gagal mengambil data pesanan", error: error.message });
  }
};
