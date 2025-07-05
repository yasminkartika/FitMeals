const dbConnect = require("../config/database.js");
const Menu = require("../models/Menu.js");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const { kategori, minggu } = req.query;
    let filter = { status: "aktif" }; // Hanya menu yang aktif
    
    if (kategori) {
      filter.kategori = kategori;
    }

    // Filter berdasarkan minggu jika ada
    if (minggu) {
      filter.minggu = parseInt(minggu);
    } else {
      // Jika tidak ada minggu yang diminta, ambil minggu saat ini
      const now = new Date();
      const currentWeek = getWeekNumber(now);
      filter.minggu = currentWeek;
    }
    
    const menus = await Menu.find(filter).sort({ urutan: 1, createdAt: -1 });
    return res.status(200).json({ menus });
  } catch (error) {
    console.error("Get public menu error:", error);
    return res.status(500).json({ message: "Gagal mengambil data menu", error: error.message });
  }
};

// Fungsi untuk mendapatkan nomor minggu saat ini
function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
} 