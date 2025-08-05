const fs = require('fs');
const path = require('path');
const Menu = require('../models/Menu.js');
const dbConnect = require('../config/database.js');

async function migrateMenuImages() {
  try {
    console.log('🚀 Starting menu images migration...');
    
    await dbConnect();
    
    // Ambil semua menu
    const menus = await Menu.find({});
    console.log(`📋 Found ${menus.length} menus to migrate`);
    
    for (const menu of menus) {
      console.log(`🔄 Processing menu: ${menu.nama}`);
      
      if (menu.gambar) {
        // Cek apakah gambar menggunakan path lama
        if (menu.gambar.startsWith('/uploads/') && !menu.gambar.includes('fitmeals_menu')) {
          const oldPath = path.join(process.cwd(), menu.gambar.substring(1)); // Remove leading slash
          const fileName = path.basename(menu.gambar);
          const newPath = path.join(process.cwd(), 'uploads', 'fitmeals_menu', fileName);
          
          console.log(`📁 Old path: ${oldPath}`);
          console.log(`📁 New path: ${newPath}`);
          
          // Cek apakah file lama ada
          if (fs.existsSync(oldPath)) {
            // Buat folder baru jika belum ada
            const newDir = path.dirname(newPath);
            if (!fs.existsSync(newDir)) {
              fs.mkdirSync(newDir, { recursive: true });
            }
            
            // Copy file ke lokasi baru
            fs.copyFileSync(oldPath, newPath);
            console.log(`✅ Copied: ${fileName}`);
            
            // Update database dengan path baru
            const newImagePath = `/uploads/fitmeals_menu/${fileName}`;
            await Menu.findByIdAndUpdate(menu._id, { gambar: newImagePath });
            console.log(`💾 Updated database: ${newImagePath}`);
          } else {
            console.log(`⚠️  File not found: ${oldPath}`);
          }
        } else if (menu.gambar.includes('res.cloudinary.com')) {
          console.log(`☁️  Cloudinary image, skipping: ${menu.gambar}`);
        } else {
          console.log(`ℹ️  Already migrated or unknown format: ${menu.gambar}`);
        }
      } else {
        console.log(`⚠️  No image for menu: ${menu.nama}`);
      }
    }
    
    console.log('✅ Menu images migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Jalankan migrasi jika script dijalankan langsung
if (require.main === module) {
  migrateMenuImages();
}

module.exports = migrateMenuImages; 