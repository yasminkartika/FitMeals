const dbConnect = require("../lib/db.js");
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { fullName, username, email, phone, password, confirmPassword } =
    req.body;

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Password tidak sama" });
  }

  if (!fullName || !username || !email || !phone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi!" });
  }

  await dbConnect();

  const existingEmail = await User.findOne({ email });
  if (existingEmail)
    return res
      .status(409)
      .json({ success: false, message: "Email sudah terdaftar" });

  const existingUsername = await User.findOne({ username });
  if (existingUsername)
    return res
      .status(409)
      .json({ success: false, message: "Username sudah terdaftar" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    namaLengkap: fullName,
    username,
    email,
    nomorHP: phone,
    password: hashedPassword,
    role: "user",
  });

  await newUser.save();
  res.status(201).json({ success: true, message: "Berhasil daftar!" });
}

module.exports = handler;
