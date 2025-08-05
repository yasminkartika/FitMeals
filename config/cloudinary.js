const cloudinary = require('cloudinary').v1;

// Validasi environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ Cloudinary environment variables tidak lengkap!");
    console.error("Di production, Cloudinary wajib dikonfigurasi");
    console.error("Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET sudah diset di Railway");
    process.exit(1);
  } else {
    console.warn("⚠️  Cloudinary environment variables tidak lengkap!");
    console.warn("Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET sudah diset");
    console.warn("Upload foto akan menggunakan penyimpanan lokal sebagai fallback (development only)");
    
    // Gunakan default values atau disable Cloudinary
    module.exports = null;
    return;
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("✅ Cloudinary configured successfully");

module.exports = cloudinary; 