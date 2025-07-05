const authenticateJWT = require("../middleware.js");
const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");

module.exports = function handler(req, res) {
  authenticateJWT(req, res, async () => {
    try {
      await dbConnect();
      
      // Ambil data lengkap dari database
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });
};
