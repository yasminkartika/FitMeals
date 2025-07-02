const dbConnect = require("../../config/database.js");
const User = require("../../models/User.js");
const bcrypt = require("bcryptjs");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { namaLengkap, email, nomorHP, password, secretKey } = req.body;

  // Validasi input
  if (!namaLengkap || !email || !nomorHP || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  // Secret key untuk keamanan (ganti dengan key yang aman)
  const ADMIN_SECRET_KEY = "fitmeals_admin_2024";
  if (secretKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: "Secret key tidak valid" });
  }

  try {
    await dbConnect();
    console.log("Database connected for admin creation");

    // Cek apakah sudah ada admin
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin sudah ada dalam sistem" });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Password hashed successfully");

    // Buat user admin
    const adminUser = new User({
      namaLengkap,
      email: email.toLowerCase(),
      nomorHP,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully");

    // Kirim response tanpa password
    const { password: _, ...adminData } = adminUser._doc;

    return res.status(201).json({
      message: "Admin berhasil dibuat",
      admin: adminData,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({ 
      message: "Terjadi kesalahan server",
      error: error.message 
    });
  }
} 