const cloudinary = require('cloudinary').v1;

// Validasi environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️  Cloudinary environment variables tidak lengkap!");
  console.warn("Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET sudah diset");
  console.warn("Upload foto akan menggunakan penyimpanan lokal sebagai fallback");
  
  // Gunakan default values atau disable Cloudinary
  module.exports = null;
  return;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("✅ Cloudinary configured successfully");

module.exports = cloudinary; 