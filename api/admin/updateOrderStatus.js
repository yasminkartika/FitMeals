const dbConnect = require("../../config/database.js");
const Order = require("../../models/Order.js");
const User = require("../../models/User.js");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
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

    const { orderId } = req.params;
    const { status, notes } = req.body;

    // Validasi status
    const validStatuses = ['Pending Payment', 'Paid', 'Processing', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    // Cari dan update pesanan
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Update status dan catatan
    order.status = status;
    if (notes) {
      order.adminNotes = notes;
    }
    order.statusUpdatedAt = new Date();
    order.statusUpdatedBy = userId;

    await order.save();

    // Ambil data pesanan yang sudah diupdate
    const updatedOrder = await Order.findById(orderId).populate('userId', 'namaLengkap email');

    return res.status(200).json({ 
      success: true,
      message: "Status pesanan berhasil diupdate",
      order: updatedOrder 
    });

  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Gagal mengupdate status pesanan", 
      error: error.message 
    });
  }
};
