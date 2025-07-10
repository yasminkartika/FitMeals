const mongoose = require('mongoose');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

(async () => {
  try {
    // Koneksi ke database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitmeals', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Cari user yang fotoProfil-nya bukan URL Cloudinary dan file-nya ada
    const users = await User.find({
      fotoProfil: { $exists: true, $ne: null, $not: /res\.cloudinary\.com/ }
    });

    console.log(`Found ${users.length} users with local profile photos.`);

    for (const user of users) {
      const localPath = user.fotoProfil;
      if (!fs.existsSync(localPath)) {
        console.warn(`File not found: ${localPath} (user: ${user._id})`);
        continue;
      }
      try {
        // Upload ke Cloudinary
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'fitmeals/profiles',
          public_id: 'profile-' + user._id + '-' + Date.now(),
        });
        // Update database
        user.fotoProfil = result.secure_url;
        await user.save();
        // Hapus file lokal
        fs.unlinkSync(localPath);
        console.log(`Migrated & deleted local: ${localPath} => ${result.secure_url}`);
      } catch (err) {
        console.error(`Failed to migrate ${localPath} (user: ${user._id}):`, err.message);
      }
    }
    console.log('Migration finished.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})(); 