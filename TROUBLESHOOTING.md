# 🔧 Troubleshooting Admin Login

## Masalah Umum dan Solusi

### 1. **"Email tidak ditemukan"**
**Penyebab**: Admin belum dibuat atau email salah

**Solusi**:
```bash
# Buat admin pertama
curl -X POST http://localhost:3000/api/admin/createAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "Admin FitMeals",
    "email": "admin@fitmeals.com",
    "nomorHP": "081234567890",
    "password": "admin123",
    "secretKey": "fitmeals_admin_2024"
  }'
```

### 2. **"Password salah"**
**Penyebab**: Password yang dimasukkan tidak sesuai

**Solusi**:
- Pastikan password yang dimasukkan benar
- Jika lupa password, buat admin baru atau reset di database

### 3. **"Akses ditolak. Anda tidak memiliki hak akses admin"**
**Penyebab**: User tidak memiliki role "admin"

**Solusi**:
```javascript
// Update user menjadi admin di database
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### 4. **"Terjadi kesalahan server"**
**Penyebab**: Database connection atau server error

**Solusi**:
1. Pastikan MongoDB berjalan
2. Cek environment variable `MONGODB_URI`
3. Jalankan test script:
```bash
node test-admin.js
```

### 5. **"Method not allowed"**
**Penyebab**: Request method bukan POST

**Solusi**:
- Pastikan menggunakan POST request
- Cek URL endpoint: `/api/admin/login`

## 🔍 Debug Steps

### Step 1: Test Database Connection
```bash
node test-admin.js
```

### Step 2: Check Server Logs
Lihat console log untuk error messages:
- "Database connected successfully"
- "User search result: User found/not found"
- "Password match: true/false"
- "User role: admin/user"

### Step 3: Check Browser Network Tab
1. Buka Developer Tools (F12)
2. Pilih tab Network
3. Coba login
4. Lihat request ke `/api/admin/login`
5. Cek response status dan body

### Step 4: Check localStorage
```javascript
// Di browser console
console.log("Admin data:", localStorage.getItem("admin"));
console.log("Admin token:", localStorage.getItem("adminToken"));
```

## 🛠️ Quick Fixes

### Fix 1: Clear localStorage
```javascript
// Di browser console
localStorage.clear();
// Refresh halaman
```

### Fix 2: Reset Admin Password
```javascript
// Di database
const bcrypt = require("bcryptjs");
const newPassword = await bcrypt.hash("admin123", 12);
db.users.updateOne(
  { email: "admin@fitmeals.com" },
  { $set: { password: newPassword } }
)
```

### Fix 3: Create New Admin
```bash
# Hapus admin lama dulu
curl -X DELETE http://localhost:3000/api/admin/deleteUser \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fitmeals.com"}'

# Buat admin baru
curl -X POST http://localhost:3000/api/admin/createAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "New Admin",
    "email": "newadmin@fitmeals.com",
    "nomorHP": "081234567890",
    "password": "admin123",
    "secretKey": "fitmeals_admin_2024"
  }'
```

## 📋 Checklist

- [ ] MongoDB berjalan
- [ ] Environment variable `MONGODB_URI` terset
- [ ] Admin user sudah dibuat
- [ ] Admin memiliki role "admin"
- [ ] Password admin benar
- [ ] Server berjalan di port yang benar
- [ ] API endpoint `/api/admin/login` bisa diakses
- [ ] Browser tidak memblokir request

## 🆘 Still Having Issues?

1. **Check server logs** untuk error details
2. **Run test script**: `node test-admin.js`
3. **Check database** langsung:
   ```bash
   mongo
   use fitmeals
   db.users.find({role: "admin"})
   ```
4. **Restart server** dan coba lagi
5. **Clear browser cache** dan localStorage

## 📞 Support

Jika masih bermasalah, cek:
- Server console logs
- Browser console logs
- Network tab di Developer Tools
- Database connection status 