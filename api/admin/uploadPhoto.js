const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary.js');
const path = require('path');
const { verifyAdmin } = require('./middleware');
const User = require('../../models/User.js');

// Konfigurasi Multer untuk upload ke Cloudinary
const createStorage = (folder) => {
  console.log("🔧 Creating CloudinaryStorage for folder:", folder);
  
  try {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: folder,
        allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
        public_id: (req, file) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          return folder === 'fitmeals/menu' ? 'menu-' + uniqueSuffix : 'admin-profile-' + uniqueSuffix;
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating CloudinaryStorage:", error);
    throw error;
  }
};

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

// POST /api/admin/uploadPhoto - untuk foto profil admin
router.post('/', verifyAdmin, (req, res) => {
  const upload = multer({
    storage: createStorage('fitmeals/profiles'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
  });

  upload.single('photo')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    try {
      // Hapus foto profil lama jika ada
      const currentUser = await User.findById(req.user._id);
      if (currentUser && currentUser.fotoProfil && currentUser.fotoProfil.includes('res.cloudinary.com')) {
        const regex = /fitmeals\/profiles\/([^\.\/]+)\./;
        const match = currentUser.fotoProfil.match(regex);
        if (match && match[1]) {
          const publicId = `fitmeals/profiles/${match[1]}`;
          try {
            // Gunakan cloudinary v1 API
            await cloudinary.uploader.destroy(publicId, (result) => {
              console.log("Old photo deleted:", result);
            });
          } catch (e) {
            console.warn("Failed to delete old photo:", e.message);
            // Tidak masalah jika gagal hapus
          }
        }
      }

      // Update user dengan foto profil baru
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
      console.error("Upload photo error:", error);
      res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
    }
  });
});

// POST /api/admin/uploadPhoto/menu - untuk foto menu
router.post('/menu', verifyAdmin, (req, res) => {
  console.log("📸 Upload foto menu request received");
  
  const upload = multer({
    storage: createStorage('fitmeals/menu'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
  });

  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer error:", err);
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    try {
      console.log("✅ File uploaded successfully:", req.file);
      const photoUrl = req.file.path;
      console.log("📸 Photo URL:", photoUrl);
      
      res.json({
        message: 'Foto menu berhasil diupload',
        imageUrl: photoUrl
      });
    } catch (error) {
      console.error("❌ Upload menu photo error:", error);
      res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
    }
  });
});

module.exports = router; 