const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const JWT_SECRET = process.env.JWT_SECRET || "fitmeals_secret";

async function removePhoto(req, res) {
  try {
    await dbConnect();
    
    // Check if user is authenticated via JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Token tidak valid atau expired" });
    }

    const userId = decoded.id;

    // Ambil user saat ini
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Hapus file foto dari server jika ada
    if (currentUser.fotoProfil && fs.existsSync(currentUser.fotoProfil)) {
      try {
        fs.unlinkSync(currentUser.fotoProfil);
      } catch (error) {
        console.error("Error deleting file:", error);
        // Lanjutkan meskipun file tidak bisa dihapus
      }
    }

    // Update user dengan menghapus foto profil
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fotoProfil: null },
      { new: true, runValidators: true }
    );

    // Create new JWT with updated data
    const newPayload = {
      id: updatedUser._id,
      username: updatedUser.username,
      namaLengkap: updatedUser.namaLengkap,
      email: updatedUser.email,
      nomorHP: updatedUser.nomorHP,
      role: updatedUser.role || "user",
    };
    const newToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Foto profil berhasil dihapus",
      user: {
        _id: updatedUser._id,
        namaLengkap: updatedUser.namaLengkap,
        email: updatedUser.email,
        nomorHP: updatedUser.nomorHP,
        username: updatedUser.username,
        role: updatedUser.role,
        tanggalLahir: updatedUser.tanggalLahir,
        alamat: updatedUser.alamat,
        fotoProfil: updatedUser.fotoProfil
      },
      token: newToken
    });

  } catch (error) {
    console.error("Error removing photo:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

module.exports = removePhoto; 