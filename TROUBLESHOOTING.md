# Troubleshooting - Upload Foto Profil

## Masalah Umum dan Solusi

### 1. Error: "Ukuran file terlalu besar"
**Penyebab:** File yang diupload melebihi batas 5MB
**Solusi:** 
- Kompres gambar sebelum upload
- Gunakan format gambar yang lebih efisien (JPEG untuk foto, PNG untuk gambar dengan transparansi)
- Resize gambar ke ukuran yang lebih kecil

### 2. Error: "Hanya file gambar yang diperbolehkan"
**Penyebab:** File yang diupload bukan format gambar yang didukung
**Solusi:**
- Pastikan file adalah gambar dengan format: JPEG, JPG, PNG, GIF, atau WebP
- Periksa ekstensi file dan MIME type

### 3. Error: "Token tidak valid"
**Penyebab:** Token JWT expired atau tidak valid
**Solusi:**
- Logout dan login kembali
- Periksa apakah token tersimpan dengan benar di localStorage
- Pastikan server berjalan dengan benar

### 4. Error: "Tidak ada file yang diupload"
**Penyebab:** FormData tidak terkirim dengan benar
**Solusi:**
- Pastikan input file memiliki name="photo"
- Periksa apakah file dipilih sebelum upload
- Pastikan tidak ada error JavaScript di console browser

### 5. Error: "Terjadi kesalahan server"
**Penyebab:** Masalah di server side
**Solusi:**
- Periksa console server untuk error log
- Pastikan folder `uploads/profiles` dapat dibuat
- Periksa permission folder uploads
- Pastikan database MongoDB berjalan

## Debugging Steps

### 1. Periksa Console Browser
```javascript
// Buka Developer Tools (F12) dan lihat tab Console
// Cari error yang berhubungan dengan fetch atau upload
```

### 2. Periksa Network Tab
```javascript
// Di Developer Tools, buka tab Network
// Upload file dan lihat request yang dikirim
// Periksa response dari server
```

### 3. Periksa Console Server
```bash
# Lihat log server saat upload
# Cari pesan error atau warning
```

### 4. Test API Manual
```bash
# Test dengan curl atau Postman
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  http://localhost:3000/api/user/uploadPhoto
```

## Konfigurasi Server

### 1. Pastikan Multer Terinstall
```bash
npm install multer
```

### 2. Periksa Permission Folder
```bash
# Pastikan folder uploads dapat dibuat dan ditulis
mkdir -p uploads/profiles
chmod 755 uploads
chmod 755 uploads/profiles
```

### 3. Periksa Environment Variables
```env
# Pastikan JWT_SECRET sudah diset
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb://localhost:27017/fitmeals
```

## Struktur File Upload

```
fitmeals/
├── uploads/
│   └── profiles/
│       ├── profile-1234567890-123456789.jpg
│       └── profile-1234567891-123456790.png
```

## Validasi Frontend

### 1. Validasi File Size
```javascript
if (file.size > 5 * 1024 * 1024) {
  alert("Ukuran file terlalu besar. Maksimal 5MB");
  return;
}
```

### 2. Validasi File Type
```javascript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  alert("Hanya file gambar yang diperbolehkan");
  return;
}
```

### 3. FormData Setup
```javascript
const formData = new FormData();
formData.append('photo', file);
// Jangan set Content-Type header untuk FormData
```

## Error Codes

| Error Code | Pesan | Solusi |
|------------|-------|--------|
| 400 | Ukuran file terlalu besar | Kompres atau resize gambar |
| 400 | Hanya file gambar yang diperbolehkan | Gunakan format gambar yang valid |
| 401 | Token tidak valid | Login ulang |
| 404 | User tidak ditemukan | Periksa database |
| 500 | Terjadi kesalahan server | Periksa log server |

## Tips Performance

1. **Kompres Gambar:** Gunakan tools online untuk kompres gambar sebelum upload
2. **Resize Gambar:** Resize ke ukuran yang wajar (misal 500x500px)
3. **Format Optimal:** Gunakan JPEG untuk foto, PNG untuk gambar dengan transparansi
4. **Lazy Loading:** Implementasi lazy loading untuk foto profil

## Monitoring

### 1. File Size Monitoring
```javascript
// Monitor ukuran file yang diupload
console.log('File size:', file.size, 'bytes');
```

### 2. Upload Progress
```javascript
// Tambahkan progress bar untuk upload
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100;
  console.log('Upload progress:', percent + '%');
});
```

### 3. Error Tracking
```javascript
// Track error untuk analytics
.catch(err => {
  console.error('Upload error:', err);
  // Send error to analytics service
});
``` 