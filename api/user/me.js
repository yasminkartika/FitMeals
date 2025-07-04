const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Cek session terlebih dahulu
  if (req.session && req.session.user) {
    try {
      await dbConnect();
      const user = await User.findById(req.session.user.id);
      if (!user) {
        // Clear invalid session
        req.session.destroy();
        return res.status(401).json({ message: "User tidak ditemukan" });
      }
      
      // Update session dengan data terbaru
      req.session.user = {
        ...req.session.user,
        lastActivity: new Date().toISOString()
      };
      
      const { password, ...userData } = user._doc;
      return res.status(200).json(userData);
    } catch (error) {
      console.error("Session auth error:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  // Jika tidak ada session, cek token dari Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.substring(7); // Hapus 'Bearer '
  
  // Cek apakah token ada di session (untuk token yang baru)
  if (req.session && req.session.token === token) {
    try {
      await dbConnect();
      const user = await User.findById(req.session.user.id);
      if (!user) {
        req.session.destroy();
        return res.status(401).json({ message: "User tidak ditemukan" });
      }
      
      const { password, ...userData } = user._doc;
      return res.status(200).json(userData);
    } catch (error) {
      console.error("Token auth error:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  // Fallback untuk token lama (format: user_{userId}_{timestamp})
  const tokenParts = token.split("_");
  if (tokenParts.length < 3 || tokenParts[0] !== "user") {
    return res.status(401).json({ message: "Token tidak valid" });
  }
  const userId = tokenParts[1];

  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }
    const { password, ...userData } = user._doc;
    return res.status(200).json(userData);
  } catch (error) {
    console.error("Legacy token auth error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
