module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Clear session admin
    if (req.session.admin) {
      delete req.session.admin;
      console.log("Admin session cleared");
    }

    // Destroy session jika diperlukan
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      } else {
        console.log("Session destroyed successfully");
      }
    });

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