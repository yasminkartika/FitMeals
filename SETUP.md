# Setup Guide - FitMeals

Panduan lengkap untuk setup dan menjalankan aplikasi FitMeals.

## Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

1. **Node.js** (versi 14 atau lebih baru)
   - Download dari: https://nodejs.org/
   - Verifikasi dengan: `node --version`

2. **MongoDB** (local atau cloud)
   - **Local**: Download dari https://www.mongodb.com/try/download/community
   - **Cloud**: Gunakan MongoDB Atlas (gratis)

3. **Git** (untuk clone repository)
   - Download dari: https://git-scm.com/

## Langkah Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd fitmeals
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root directory dengan konfigurasi berikut:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fitmeals

# JWT Secret Key (ganti dengan secret key yang aman)
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=development

# Server Configuration
PORT=3000
```

**Catatan Penting:**
- Ganti `your_super_secret_jwt_key_here` dengan secret key yang aman
- Jika menggunakan MongoDB Atlas, ganti `MONGODB_URI` dengan connection string dari Atlas

### 4. Setup Database

#### Option A: MongoDB Local
1. Install MongoDB di komputer Anda
2. Jalankan MongoDB service
3. Database akan otomatis dibuat saat aplikasi pertama kali dijalankan

#### Option B: MongoDB Atlas (Recommended)
1. Buat akun di [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Buat cluster baru (gratis)
3. Buat database user
4. Dapatkan connection string
5. Update `MONGODB_URI` di file `.env.local`

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 6. Akses Aplikasi

- **Homepage**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login.html`
- **Register**: `http://localhost:3000/register.html`
- **Dashboard**: `http://localhost:3000/dashboard.html`
- **Profile**: `http://localhost:3000/profile.html`

## Testing

### 1. Register User Baru
1. Buka `http://localhost:3000/register.html`
2. Isi form registrasi
3. Klik "Register"

### 2. Login
1. Buka `http://localhost:3000/login.html`
2. Masukkan email dan password
3. Klik "Login"

### 3. Test Profile Management
1. Login ke aplikasi
2. Buka halaman profile
3. Test update informasi pribadi
4. Test update info akun

## Troubleshooting

### Error: "MongoDB connection failed"
- Pastikan MongoDB berjalan
- Periksa `MONGODB_URI` di file `.env.local`
- Pastikan network connection ke database

### Error: "JWT_SECRET is not defined"
- Pastikan file `.env.local` ada di root directory
- Periksa format file `.env.local`
- Restart server setelah mengubah environment variables

### Error: "Port 3000 is already in use"
- Ganti port di file `.env.local`
- Atau matikan aplikasi yang menggunakan port 3000

### Error: "Module not found"
- Jalankan `npm install` untuk menginstall dependencies
- Periksa file `package.json`

## Development

### Struktur File Penting
```
fitmeals/
├── api/user/
│   ├── updateProfile.js    # API update informasi pribadi
│   ├── updateAccount.js    # API update info akun
│   └── me.js              # API get user data
├── models/
│   └── User.js            # Database model
├── lib/
│   └── db.js              # Database connection
├── profile.html           # Halaman profile
└── server.js              # Main server
```

### API Endpoints

#### Update Profile
```javascript
POST /api/user/updateProfile
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
Body: {
  namaLengkap: "string",
  email: "string",
  nomorHP: "string",
  tanggalLahir: "YYYY-MM-DD", // optional
  alamat: ["string"] // optional
}
```

#### Update Account
```javascript
POST /api/user/updateAccount
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
Body: {
  username: "string", // optional
  password: "string"  // optional
}
```

## Production Deployment

### Environment Variables untuk Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitmeals
JWT_SECRET=very_secure_secret_key_here
NODE_ENV=production
PORT=3000
```

### Security Checklist
- [ ] Ganti JWT_SECRET dengan secret key yang aman
- [ ] Gunakan HTTPS di production
- [ ] Set NODE_ENV=production
- [ ] Gunakan MongoDB Atlas atau managed database
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up logging

## Support

Jika mengalami masalah:
1. Periksa console browser untuk error JavaScript
2. Periksa terminal server untuk error backend
3. Periksa MongoDB connection
4. Pastikan semua environment variables sudah benar 