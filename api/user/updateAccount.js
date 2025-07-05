const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fitmeals_secret";

async function updateAccount(req, res) {
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

    const { username, password } = req.body;
    const userId = decoded.id;

    // Validate that at least one field is provided
    if (!username && !password) {
      return res.status(400).json({ 
        message: "Username atau password harus diisi" 
      });
    }

    // Prepare update data
    const updateData = {};

    // Validate and add username if provided
    if (username) {
      if (username.length < 8) {
        return res.status(400).json({ 
          message: "Username harus minimal 8 karakter" 
        });
      }

      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username sudah digunakan oleh user lain" 
        });
      }

      updateData.username = username;
    }

    // Validate and add password if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ 
          message: "Password harus minimal 8 karakter" 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user account
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
      message: "Info akun berhasil disimpan",
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
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

module.exports = updateAccount; 