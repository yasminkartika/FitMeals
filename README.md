# FitMeals - Aplikasi Catering Sehat

Aplikasi web untuk pemesanan catering sehat dengan sistem autentikasi dan dashboard user.

## 🚀 Cara Menjalankan Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan MongoDB
Pastikan MongoDB sudah terinstall dan berjalan di komputer kamu.

### 3. Jalankan Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

### 4. Akses Aplikasi
- **Login Page:** `http://localhost:3000/login.html`
- **Dashboard:** `http://localhost:3000/dashboard.html`

## 🔑 Default Credentials

Silakan buat user melalui halaman register atau langsung di database MongoDB.

## 🛠️ Fitur
- Login & register user
- Dashboard user
- Session-based authentication
- Logout

## 📁 Struktur File Penting

```
fitmeals/
├── api/
│   ├── login.js          # API login
│   ├── user/me.js        # API get user data
│   └── logout.js         # API logout
├── models/
│   └── User.js           # Mongoose user model
├── config/
│   └── database.js       # Database config
├── lib/
│   └── db.js             # DB connection helper
├── dashboard.html        # Halaman dashboard
├── login.html           # Halaman login
└── server.js            # Server utama
```

## 🔧 Troubleshooting

Jika mengalami masalah, pastikan MongoDB sudah berjalan dan environment variable sudah benar.

## 📝 Testing

1. Register user baru
2. Login dengan user tersebut
3. Jika berhasil, akan redirect ke dashboard

## 🚀 Deployment

Untuk deployment ke production:
1. Install MongoDB
2. Set environment variables
3. Deploy ke platform seperti Heroku, Vercel, atau server VPS
