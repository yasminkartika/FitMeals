module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Untuk implementasi sederhana, kita hanya return success
    // Dalam implementasi yang lebih kompleks, kita bisa:
    // 1. Blacklist token
    // 2. Clear session dari database
    // 3. Update last logout time

    console.log("Admin logout successful");

    return res.status(200).json({
      message: "Logout berhasil",
      success: true,
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    return res.status(500).json({ 
      message: "Terjadi kesalahan server",
      error: error.message 
    });
  }
} 