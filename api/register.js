const dbConnect = require("../lib/db.js");
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { namaLengkap, email, nomorHP, username, password } = req.body;

  // Validasi input
  if (!namaLengkap || !email || !nomorHP || !username || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    await dbConnect();

    // Cek email/username sudah terdaftar
    const existingUser = await User.findOne({ $or: [ { email: email.toLowerCase() }, { username } ] });
    if (existingUser) {
      return res.status(400).json({ message: "Email atau username sudah terdaftar" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Simpan user baru
    const user = new User({
      namaLengkap,
      email: email.toLowerCase(),
      nomorHP,
      username,
      password: hashedPassword,
      role: "user",
    });
    await user.save();

    // Response sukses
    return res.status(201).json({ message: "Akun berhasil dibuat, silakan login." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
