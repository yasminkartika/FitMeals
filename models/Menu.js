const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true,
  },
  deskripsi: {
    type: String,
    required: true,
    trim: true,
  },
  harga: {
    type: Number,
    required: true,
    min: 0,
  },
  gambar: {
    type: String,
    required: true,
  },
  kategori: {
    type: String,
    required: true,
    enum: ["sarapan", "makan_siang", "makan_malam", "snack", "minuman"],
  },
  nutrisi: {
    kalori: { type: Number, default: 0 },
    lemak: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    karbohidrat: { type: Number, default: 0 },
    serat: { type: Number, default: 0 },
    gula: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["aktif", "nonaktif"],
    default: "aktif",
  },
  urutan: {
    type: Number,
    default: 0,
  },
  minggu: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  tanggalMulai: {
    type: Date,
    required: true,
  },
  tanggalSelesai: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp sebelum save
menuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Menu || mongoose.model("Menu", menuSchema); 