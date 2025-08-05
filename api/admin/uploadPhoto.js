const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyAdmin } = require('./middleware');
const User = require('../../models/User.js');

// Cek apakah Cloudinary tersedia
const cloudinary = require('../../config/cloudinary.js');
const CloudinaryStorage = cloudinary ? require('multer-storage-cloudinary').CloudinaryStorage : null;

// Konfigurasi storage berdasarkan ketersediaan Cloudinary
const createStorage = (folder) => {
  console.log("🔧 Creating storage for folder:", folder);
  
  if (cloudinary && CloudinaryStorage) {
    console.log("☁️  Using Cloudinary storage");
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
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cloudinary is required in production environment');
    }
    
    console.log("💾 Using local storage as fallback (development only)");
    // Pastikan folder uploads ada
    const uploadDir = path.join(process.cwd(), 'uploads', folder.replace('/', '_'));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
      }
    });
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
      // Hapus foto profil lama jika ada (hanya jika menggunakan Cloudinary)
      if (cloudinary) {
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
      }

      // Update user dengan foto profil baru
      let photoUrl;
      if (cloudinary && req.file.path && req.file.path.includes('res.cloudinary.com')) {
        // Cloudinary response
        photoUrl = req.file.path;
        console.log("☁️  Cloudinary profile photo URL:", photoUrl);
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Expected Cloudinary URL in production');
        }
        // Local storage response (development only)
        photoUrl = `/uploads/fitmeals_profiles/${req.file.filename}`;
        console.log("💾 Local profile photo URL:", photoUrl);
      }
      
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
      
      // Handle response berdasarkan storage type
      let photoUrl;
      if (cloudinary && req.file.path && req.file.path.includes('res.cloudinary.com')) {
        // Cloudinary response
        photoUrl = req.file.path;
        console.log("☁️  Cloudinary photo URL:", photoUrl);
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Expected Cloudinary URL in production');
        }
        // Local storage response (development only)
        photoUrl = `/uploads/fitmeals_menu/${req.file.filename}`;
        console.log("💾 Local photo URL:", photoUrl);
      }
      
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