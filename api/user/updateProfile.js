const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fitmeals_secret";

async function updateProfile(req, res) {
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

    const { namaLengkap, email, nomorHP, tanggalLahir, alamat } = req.body;
    const userId = decoded.id;

    // Validate required fields
    if (!namaLengkap || !email || !nomorHP) {
      return res.status(400).json({ 
        message: "Nama lengkap, email, dan nomor HP harus diisi" 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email sudah digunakan oleh user lain" 
      });
    }

    // Prepare update data
    const updateData = {
      namaLengkap,
      email,
      nomorHP
    };

    // Add optional fields if provided
    if (tanggalLahir) {
      updateData.tanggalLahir = new Date(tanggalLahir);
    }
    
    if (alamat && Array.isArray(alamat)) {
      updateData.alamat = alamat.filter(addr => addr.trim() !== '');
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

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
      message: "Informasi pribadi berhasil disimpan",
      user: {
        _id: updatedUser._id,
        namaLengkap: updatedUser.namaLengkap,
        email: updatedUser.email,
        nomorHP: updatedUser.nomorHP,
        username: updatedUser.username,
        role: updatedUser.role,
        tanggalLahir: updatedUser.tanggalLahir,
        alamat: updatedUser.alamat
      },
      token: newToken
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

module.exports = updateProfile; 