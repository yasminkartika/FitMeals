# FitMeals Admin System

Sistem admin untuk mengelola aplikasi FitMeals dengan autentikasi dan otorisasi yang aman.

## Fitur

- 🔐 **Autentikasi Admin**: Login khusus untuk admin dengan role-based access control
- 🛡️ **Keamanan**: Middleware untuk verifikasi token dan role admin
- 📊 **Dashboard**: Statistik pengguna, pesanan, dan pendapatan
- 👥 **Manajemen User**: Lihat dan kelola semua pengguna
- 📦 **Manajemen Pesanan**: Lihat dan update status pesanan
- 🚪 **Logout**: Sistem logout yang aman

## File Struktur

```
admin/
├── login.html          # Halaman login admin
├── dashboard.html      # Dashboard admin utama
├── README.md          # Dokumentasi ini
└── ...

api/admin/
├── login.js           # API endpoint untuk login admin
├── logout.js          # API endpoint untuk logout admin
├── createAdmin.js     # Utility untuk membuat admin pertama
├── middleware.js      # Middleware untuk verifikasi admin
├── getUsers.js        # API untuk mendapatkan semua user
├── getOrders.js       # API untuk mendapatkan semua pesanan
├── deleteUser.js      # API untuk menghapus user
└── updateOrderStatus.js # API untuk update status pesanan
```

## Setup Awal

### 1. Buat Admin Pertama

Untuk membuat admin pertama, gunakan endpoint `/api/admin/createAdmin`:

```bash
curl -X POST http://localhost:3000/api/admin/createAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "Admin FitMeals",
    "email": "admin@fitmeals.com",
    "nomorHP": "081234567890",
    "password": "gajahmungkur",
    "secretKey": "fitmeals_admin_2024"
  }'
```

**Catatan**: Ganti `secretKey` dengan key yang aman di file `createAdmin.js`.

### 2. Login Admin

1. Buka `admin/login.html`
2. Masukkan email dan password admin
3. Setelah berhasil, akan redirect ke dashboard

## API Endpoints

### POST /api/admin/login

Login admin dengan email dan password.

**Request:**

```json
{
  "email": "admin@fitmeals.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "message": "Login admin berhasil",
  "user": {
    "_id": "...",
    "namaLengkap": "Admin FitMeals",
    "email": "admin@fitmeals.com",
    "role": "admin"
  },
  "token": "admin_..._..."
}
```

### POST /api/admin/logout

Logout admin dan clear session.

**Headers:**

```
Authorization: Bearer admin_..._...
```

### GET /api/admin/getUsers

Mendapatkan semua user (hanya admin).

**Headers:**

```
Authorization: Bearer admin_..._...
```

### GET /api/admin/getOrders

Mendapatkan semua pesanan (hanya admin).

**Headers:**

```
Authorization: Bearer admin_..._...
```

## Keamanan

### Middleware

- `verifyAdmin`: Verifikasi token admin dari header Authorization
- `verifyAdminFromStorage`: Verifikasi data admin dari localStorage (untuk frontend)

### Token System

- Token format: `admin_{userId}_{timestamp}`
- Token disimpan di localStorage sebagai `adminToken`
- Token digunakan untuk semua request API admin

### Role-based Access

- Hanya user dengan `role: "admin"` yang bisa akses
- Semua endpoint admin memerlukan verifikasi role

## Penggunaan

### Frontend

1. **Login**: `admin/login.html`
2. **Dashboard**: `admin/dashboard.html`

### Backend

Semua API admin berada di folder `api/admin/` dan menggunakan middleware untuk keamanan.

## Troubleshooting

### Error "Akses ditolak"

- Pastikan user memiliki role "admin"
- Cek token di localStorage
- Pastikan token belum expired

### Error "Token tidak valid"

- Clear localStorage dan login ulang
- Cek format token di header Authorization

### Error "Secret key tidak valid"

- Ganti secret key di `createAdmin.js`
- Pastikan secret key yang dikirim sesuai

## Pengembangan

### Menambah Fitur Admin Baru

1. Buat endpoint di `api/admin/`
2. Gunakan middleware `verifyAdmin`
3. Tambahkan UI di `dashboard.html`

### Menambah Role Baru

1. Update enum di `models/User.js`
2. Update middleware untuk handle role baru
3. Update frontend untuk role baru

## Catatan Penting

- **Secret Key**: Ganti secret key default di `createAdmin.js`
- **Token**: Implementasi JWT untuk produksi
- **Database**: Pastikan MongoDB terhubung
- **Environment**: Set environment variables untuk produksi
