# Changelog

## [1.1.0] - 2024-01-XX

### Added
- Pemisahan penyimpanan informasi pribadi dan info akun
- Field baru pada model User: `tanggalLahir` dan `alamat`
- Validasi yang lebih ketat untuk semua field
- API endpoint terpisah untuk update profile dan account
- Format tanggal yang konsisten (YYYY-MM-DD)
- Multiple alamat support
- Clear password field setelah berhasil disimpan

### Changed
- Model User diperbarui dengan field tambahan
- API `/api/user/updateProfile` sekarang menangani tanggalLahir dan alamat
- API `/api/user/updateAccount` sekarang lebih fleksibel (username atau password saja)
- API `/api/user/me` sekarang mengambil data lengkap dari database
- Frontend menggunakan fungsi terpisah: `savePersonalInfo()` dan `saveAccountInfo()`
- Tombol "Simpan Perubahan" diganti menjadi "Simpan Informasi Pribadi" dan "Simpan Info Akun"

### Fixed
- Validasi email dan username yang lebih akurat
- Handling tanggal lahir dengan format yang benar
- Filter alamat kosong sebelum disimpan
- Error handling yang lebih baik
- Konsistensi pesan error dan success

### Technical
- Menggunakan `lib/db.js` untuk koneksi database
- Improved error handling di semua API endpoints
- Better validation logic
- Consistent response format

## [1.0.0] - Initial Release

### Added
- Basic user authentication system
- User registration and login
- Profile management
- Session management
- MongoDB integration
- JWT authentication 