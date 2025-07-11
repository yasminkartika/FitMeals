const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fitmeals_secret";

// Pastikan folder uploads ada
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

// Filter file untuk memastikan hanya gambar yang diupload
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

async function uploadPhoto(req, res) {
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
    upload.single('photo')(req, res, async function (err) {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "Ukuran file terlalu besar. Maksimal 5MB" });
          }
        }
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file yang diupload" });
      }
      // Path yang akan disimpan di database
      const filePath = '/uploads/' + req.file.filename;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fotoProfil: filePath },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      res.json({
        message: "Foto profil berhasil diupload",
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
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server: " + error.message });
  }
}

module.exports = uploadPhoto; 