require("dotenv").config({ path: ".env.local" });
const express = require("express");
const cors = require("cors"); // 🟢 Tambahkan ini
const dotenv = require("dotenv");
const app = express();
const PORT = 3000;

dotenv.config();

const dbConnect = require("./lib/db.js");
const createAdmin = require("./api/admin/createAdmin.js");
const loginHandler = require("./api/admin/login.js"); // 🟢 Pastikan ini ditulis dan file `login.js` ada

// Middleware
app.use(cors()); // 🟢 Supaya frontend di localhost:5500 bisa akses
app.use(express.json());

// Routing manual
app.post("/api/admin/createAdmin", createAdmin);
app.post("/api/admin/login", loginHandler); // 🟢 Tambahkan ini
app.use("/api/register", require("./api/register.js"));

// Start server
app.listen(PORT, async () => {
  await dbConnect();
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
