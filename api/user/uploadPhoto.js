const dbConnect = require("../../lib/db.js");
const User = require("../../models/User.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary.js");
const path = require("path");
const fs = require("fs");
const JWT_SECRET = process.env.JWT_SECRET || "fitmeals_secret";

// Konfigurasi Multer untuk upload ke Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fitmeals/profiles", // folder di Cloudinary
    allowed_formats: ["jpeg", "jpg", "png", "gif", "webp"],
    public_id: (req, file) => {
      // Nama file unik
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'profile-' + uniqueSuffix;
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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

async function uploadPhoto(req, res) {
  try {
    console.log("Upload photo request received");
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
      console.error("JWT verification error:", error);
      return res.status(401).json({ message: "Token tidak valid atau expired" });
    }

    const userId = decoded.id;
    console.log("User ID:", userId);

    // Handle file upload
    upload.single('photo')(req, res, async function (err) {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "Ukuran file terlalu besar. Maksimal 5MB" });
          }
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ message: "Tidak ada file yang diupload" });
      }

      console.log("File uploaded:", req.file);

      try {
        // Hapus foto profil lama jika ada (jika sebelumnya sudah di Cloudinary)
        const currentUser = await User.findById(userId);
        if (currentUser && currentUser.fotoProfil) {
          // Jika URL Cloudinary, hapus dari Cloudinary
          if (currentUser.fotoProfil.includes("res.cloudinary.com")) {
            // Ambil public_id dari URL lama
            const regex = /fitmeals\/profiles\/([^\.\/]+)\./;
            const match = currentUser.fotoProfil.match(regex);
            if (match && match[1]) {
              const publicId = `fitmeals/profiles/${match[1]}`;
              try {
                await cloudinary.uploader.destroy(publicId);
                console.log("Old Cloudinary photo deleted:", publicId);
              } catch (e) {
                console.warn("Failed to delete old Cloudinary photo:", e.message);
              }
            }
          }
        }

        // Update user dengan foto profil baru (pakai URL Cloudinary)
        const photoUrl = req.file.path; // URL Cloudinary
        console.log("New photo URL:", photoUrl);
        
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { fotoProfil: photoUrl },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ message: "User tidak ditemukan" });
        }

        console.log("User updated successfully");

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
          },
          token: newToken
        });

      } catch (error) {
        console.error("Database error:", error);
        // Tidak perlu hapus file di Cloudinary karena upload atomic
        throw error;
      }
    });

  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: "Terjadi kesalahan server: " + error.message });
  }
}

module.exports = uploadPhoto; 