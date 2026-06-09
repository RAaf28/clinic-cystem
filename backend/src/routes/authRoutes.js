const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
// POST /api/auth/register - Daftarkan user baru
router.post("/register", register);
// POST /api/auth/login - Login, dapat token
router.post("/login", login);
// GET /api/auth/me - Info user dari token (perlu autentikasi)
router.get("/me", verifyToken, getMe);
module.exports = router;
