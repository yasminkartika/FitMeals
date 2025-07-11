const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary.js');
const path = require('path');
const { verifyAdmin } = require('./middleware');
const User = require('../../models/User.js');

// Konfigurasi Multer untuk upload ke Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fitmeals/profiles',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'admin-profile-' + uniqueSuffix;
    },
  },
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

// POST /api/admin/uploadPhoto
router.post('/', verifyAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }
    // Hapus foto profil lama jika ada (jika sebelumnya sudah di Cloudinary)
    const currentUser = await User.findById(req.user._id);
    if (currentUser && currentUser.fotoProfil && currentUser.fotoProfil.includes('res.cloudinary.com')) {
      const regex = /fitmeals\/profiles\/([^\.\/]+)\./;
      const match = currentUser.fotoProfil.match(regex);
      if (match && match[1]) {
        const publicId = `fitmeals/profiles/${match[1]}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          // Tidak masalah jika gagal hapus
        }
      }
    }
    // Update user dengan foto profil baru (pakai URL Cloudinary)
    const photoUrl = req.file.path;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fotoProfil: photoUrl },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User admin tidak ditemukan' });
    }
    res.json({
      message: 'Foto profil admin berhasil diupload',
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
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
});

module.exports = router; 