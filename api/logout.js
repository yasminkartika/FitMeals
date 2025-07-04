module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Clear session data
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Terjadi kesalahan saat logout" });
        }
        
        // Clear cookie
        res.clearCookie("connect.sid", {
          httpOnly: true,
          secure: false,
          sameSite: "lax"
        });
        
        return res.status(200).json({ message: "Logout berhasil" });
      });
    } else {
      return res.status(200).json({ message: "Logout berhasil" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
