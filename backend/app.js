const express = require("express");
const cors = require("cors");
require("dotenv").config();
// Import middleware
const errorHandler = require("./src/middleware/errorHandler");
// Import routes (akan ditambahkan seiring pengembangan)
// const authRoutes = require('./src/routes/authRoutes');
// Import routes
const authRoutes = require("./src/routes/authRoutes");
const app = express();
// ========================
// Middleware Global
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ========================
// Mount Routes
// ========================
// app.use('/api/auth', authRoutes);
app.use("/api/auth", authRoutes);
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server Sistem Klinik berjalan",
    timestamp: new Date().toISOString(),
  });
});
// ========================
// Error Handler (harus paling akhir)
// ========================
app.use(errorHandler);
module.exports = app;
