const express = require('express');
const router = express.Router();
const Menu = require('../../models/Menu');
const { verifyAdmin } = require('./middleware');
const dbConnect = require("../../config/database.js");

// GET all menu
router.get('/', verifyAdmin, async (req, res) => {
  try {
    await dbConnect();
    const { kategori, status } = req.query;
    let filter = {};
    
    if (kategori) filter.kategori = kategori;
    if (status) filter.status = status;
    
    const menus = await Menu.find(filter).sort({ urutan: 1, createdAt: -1 });
    res.json({ menus });
  } catch (error) {
    console.error("Get menu error:", error);
    res.status(500).json({ message: "Gagal mengambil data menu", error: error.message });
  }
});

// CREATE menu
router.post('/', verifyAdmin, async (req, res) => {
  try {
    await dbConnect();
    const {
      nama,
      deskripsi,
      harga,
      gambar,
      kategori,
      nutrisi = {},
      status,
      urutan,
      minggu
    } = req.body;

    if (!nama || !deskripsi || !gambar) {
      return res.status(400).json({ message: "Nama, deskripsi, dan gambar wajib diisi" });
    }

    const menuData = {
      nama,
      deskripsi,
      harga: Number(harga) || 0,
      gambar,
      kategori: kategori || "makan_siang",
      status: status || "aktif",
      urutan: urutan || 0,
      minggu: minggu || 1,
      nutrisi: {
        kalori: Number(nutrisi.kalori) || 0,
        lemak: Number(nutrisi.lemak) || 0,
        saturatedFat: Number(nutrisi.saturatedFat) || 0,
        cholesterol: Number(nutrisi.cholesterol) || 0,
        protein: Number(nutrisi.protein) || 0,
        karbohidrat: Number(nutrisi.karbohidrat) || 0,
        serat: Number(nutrisi.serat) || 0,
        gula: Number(nutrisi.gula) || 0,
        sodium: Number(nutrisi.sodium) || 0,
      },
    };

    const menu = new Menu(menuData);
    await menu.save();
    res.status(201).json({ message: "Menu berhasil dibuat", menu });
  } catch (error) {
    console.error("Create menu error:", error);
    res.status(500).json({ message: "Gagal membuat menu", error: error.message });
  }
});

// UPDATE menu
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    await dbConnect();
    const updateData = req.body;
    
    if (updateData.harga === undefined) updateData.harga = 0;
    if (!updateData.kategori) updateData.kategori = "makan_siang";
    if (!updateData.status) updateData.status = "aktif";
    if (!updateData.urutan) updateData.urutan = 0;
    if (!updateData.minggu) updateData.minggu = 1;
    updateData.nutrisi = {
      kalori: Number(updateData.nutrisi?.kalori) || 0,
      lemak: Number(updateData.nutrisi?.lemak) || 0,
      saturatedFat: Number(updateData.nutrisi?.saturatedFat) || 0,
      cholesterol: Number(updateData.nutrisi?.cholesterol) || 0,
      protein: Number(updateData.nutrisi?.protein) || 0,
      karbohidrat: Number(updateData.nutrisi?.karbohidrat) || 0,
      serat: Number(updateData.nutrisi?.serat) || 0,
      gula: Number(updateData.nutrisi?.gula) || 0,
      sodium: Number(updateData.nutrisi?.sodium) || 0,
    };
    
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!menu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }
    
    res.json({ message: "Menu berhasil diupdate", menu });
  } catch (error) {
    console.error("Update menu error:", error);
    res.status(500).json({ message: "Gagal mengupdate menu", error: error.message });
  }
});

// DELETE menu
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await dbConnect();
    const menu = await Menu.findByIdAndDelete(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }
    
    res.json({ message: "Menu berhasil dihapus" });
  } catch (error) {
    console.error("Delete menu error:", error);
    res.status(500).json({ message: "Gagal menghapus menu", error: error.message });
  }
});

module.exports = router;