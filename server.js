require("dotenv").config({ path: ".env.local" });
const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

dotenv.config();

// CORS harus di paling atas
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve static files
app.use("/uploads", express.static("uploads"));

// Session configuration - Improved for better persistence
app.use(
  session({
    secret: "WM3AL33GTGZOVPN",
    resave: false, // Changed to true for better session persistence
    saveUninitialized: false,
    cookie: {
      secure: false, // HARUS false kalau pakai http
      httpOnly: true,
      // sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 hari
    },
    name: "connect.sid",
    rolling: true, // Extends session on each request
    store: new session.MemoryStore({
      checkPeriod: 86400000, // Check for expired sessions every 24 hours
    }),
  })
);

// Middleware untuk debugging session (hanya untuk development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log("API Request:", req.method, req.path);
      console.log("Session ID:", req.sessionID);
      console.log("Session data:", req.session);
    }
    next();
  });
}

// Middleware untuk memastikan session tetap aktif
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    // Update last activity
    req.session.lastActivity = Date.now();
    req.session.touch();
  }
  next();
});

const createAdmin = require("./api/admin/createAdmin.js");
const userLoginHandler = require("./api/login.js");
const adminLoginHandler = require("./api/admin/login.js");
const getUsers = require("./api/admin/getUsers");
const getOrders = require("./api/admin/getOrders");
const menuHandler = require("./api/admin/menu");

// Routing manual
app.post("/api/admin/createAdmin", createAdmin);
app.post("/api/admin/login", adminLoginHandler);
app.get("/api/admin/getUsers", require("./api/admin/getUsers"));
app.get("/api/admin/getOrders", require("./api/admin/getOrders"));
app.use("/api/admin/menu", menuHandler);
app.use("/api/admin/uploadPhoto", require("./api/admin/uploadPhoto.js"));
app.get("/api/menu", require("./api/menu.js"));
app.post("/api/login", userLoginHandler);
app.post("/api/register", require("./api/register.js"));
app.post("/api/login", userLoginHandler);
app.get("/api/user/me", require("./api/user/me.js"));
app.post("/api/user/updateProfile", require("./api/user/updateProfile.js"));
app.post("/api/user/updateAccount", require("./api/user/updateAccount.js"));
app.post("/api/user/uploadPhoto", require("./api/user/uploadPhoto.js"));
app.post("/api/user/removePhoto", require("./api/user/removePhoto.js"));
app.post("/api/logout", require("./api/logout.js"));

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({
    message: `Selamat datang, ${req.session.user.username}`,
    user: req.session.user,
  });
});

app.get("/check-session", (req, res) => {
  console.log("Session content:", req.session);
  res.json({
    sessionExists: !!req.session,
    user: req.session?.user || null,
    sessionID: req.sessionID,
  });
});

app.get("/api/session-status", (req, res) => {
  res.json({
    authenticated: !!req.session?.user,
    user: req.session?.user || null,
    sessionID: req.sessionID,
    lastActivity: req.session?.lastActivity || null,
  });
});

// Endpoint untuk refresh session
app.post("/api/refresh-session", (req, res) => {
  if (req.session && req.session.user) {
    req.session.touch();
    req.session.lastActivity = Date.now();
    res.json({
      message: "Session refreshed",
      lastActivity: req.session.lastActivity,
    });
  } else {
    res.status(401).json({ message: "No active session" });
  }
});

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
