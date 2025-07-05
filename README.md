# FitMeals - Aplikasi Catering Sehat

Aplikasi web untuk pemesanan catering sehat dengan fitur manajemen profil pengguna yang terpisah antara informasi pribadi dan info akun.

## Fitur Utama

### Manajemen Profil Pengguna
- **Informasi Pribadi**: Nama lengkap, email, nomor HP, tanggal lahir, dan alamat
- **Info Akun**: Username dan password
- Penyimpanan terpisah untuk informasi pribadi dan info akun
- Validasi data yang ketat
- Integrasi dengan database MongoDB

### Keamanan
- Autentikasi JWT
- Password hashing dengan bcrypt
- Validasi input yang komprehensif
- Session management

## Setup dan Instalasi

### Prerequisites
- Node.js (versi 14 atau lebih baru)
- MongoDB (local atau cloud)
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd fitmeals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Buat file `.env.local` di root directory dengan konfigurasi berikut:
   ```
   MONGODB_URI=mongodb://localhost:27017/fitmeals
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. **Setup database**
   - Pastikan MongoDB berjalan di local atau gunakan MongoDB Atlas
   - Update `MONGODB_URI` di file `.env.local` sesuai dengan konfigurasi database Anda

5. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

6. **Akses aplikasi**
   - Buka browser dan akses `http://localhost:3000`
   - Untuk development dengan live server, gunakan `http://localhost:5500`

## Struktur Database

### Model User
```javascript
{
  namaLengkap: String (required),
  email: String (required, unique),
  nomorHP: String (required),
  password: String (required),
  username: String (required, unique),
  role: String (enum: ["user", "admin"]),
  tanggalLahir: Date (optional),
  alamat: [String] (optional),
  createdAt: Date
}
```

## API Endpoints

### User Management
- `POST /api/register` - Registrasi user baru
- `POST /api/login` - Login user
- `GET /api/user/me` - Ambil data user saat ini
- `POST /api/user/updateProfile` - Update informasi pribadi
- `POST /api/user/updateAccount` - Update info akun
- `POST /api/logout` - Logout user

### Admin Management
- `POST /api/admin/createAdmin` - Buat admin baru
- `POST /api/admin/login` - Login admin

## Fitur Profil Pengguna

### Informasi Pribadi
- **Nama Lengkap**: Wajib diisi
- **Email**: Wajib diisi, harus unik
- **Nomor HP**: Wajib diisi
- **Tanggal Lahir**: Opsional
- **Alamat**: Opsional, bisa multiple alamat

### Info Akun
- **Username**: Minimal 3 karakter, harus unik
- **Password**: Minimal 8 karakter

### Validasi
- Email harus valid dan unik
- Nomor HP harus valid
- Username minimal 3 karakter
- Password minimal 8 karakter
- Tanggal lahir dalam format yang valid
- Alamat tidak boleh kosong jika diisi

## Teknologi yang Digunakan

- **Backend**: Node.js, Express.js
- **Database**: MongoDB dengan Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Session Management**: express-session

## Struktur File

```
fitmeals/
├── api/                    # API endpoints
│   ├── admin/             # Admin endpoints
│   └── user/              # User endpoints
├── lib/                   # Database connection
├── models/                # Database models
├── config/                # Configuration files
├── img/                   # Images and assets
├── js/                    # Frontend JavaScript
├── src/                   # CSS source files
├── *.html                 # HTML pages
├── server.js              # Main server file
└── package.json           # Dependencies
```

## Kontribusi

1. Fork repository
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## License

Distributed under the ISC License. See `LICENSE` for more information.
