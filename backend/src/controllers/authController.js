const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/responseHelper");
/**
 * Register user baru
 * POST /api/auth/register
 * Body: { email, password, role_id, name, ...profileData }
 */
const register = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const {
      email,
      password,
      role_id,
      name,
      department_id,
      license_number,
      date_of_birth,
      address,
    } = req.body;
    // Validasi input wajib
    if (!email || !password || !role_id || !name) {
      return errorResponse(
        res,
        "Email, password, role_id, dan name wajib diisi",
      );
    }
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, "Format email tidak valid");
    }
    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return errorResponse(res, "Password minimal 6 karakter");
    }
    // Cek email sudah terdaftar
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return errorResponse(res, "Email sudah terdaftar", 409);
    }
    // Cek role valid
    const [roleData] = await pool.query(
      "SELECT id, name FROM roles WHERE id = ?",
      [role_id],
    );
    if (roleData.length === 0) {
      return errorResponse(res, "Role tidak ditemukan");
    }
    const roleName = roleData[0].name;
    // Validasi data tambahan berdasarkan role
    if (roleName === "Dokter" && (!department_id || !license_number)) {
      return errorResponse(
        res,
        "Dokter memerlukan department_id dan license_number",
      );
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Mulai transaction
    await connection.beginTransaction();
    // Insert user
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password, role_id) VALUES (?, ?, ?)",
      [email, hashedPassword, role_id],
    );
    const userId = userResult.insertId;
    let profileId = null;
    // Insert profile berdasarkan role
    if (roleName === "Dokter") {
      const [doctorResult] = await connection.query(
        "INSERT INTO doctors (user_id, department_id, name, license_number) VALUES (?, ?, ?, ?)",
        [userId, department_id, name, license_number],
      );
      profileId = doctorResult.insertId;
    } else if (roleName === "Pasien") {
      const [patientResult] = await connection.query(
        "INSERT INTO patients (user_id, name, date_of_birth, address) VALUES (?, ?, ?, ?)",
        [userId, name, date_of_birth || null, address || null],
      );
      profileId = patientResult.insertId;
    }
    await connection.commit();
    return successResponse(
      res,
      "Registrasi berhasil",
      {
        id: userId,
        email,
        role: roleName,
        name,
        profileId,
      },
      201,
    );
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validasi input
    if (!email || !password) {
      return errorResponse(res, "Email dan password wajib diisi");
    }
    // Query user dengan role
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.password, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email],
    );
    if (users.length === 0) {
      return errorResponse(res, "Email atau password salah", 401);
    }
    const user = users[0];
    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Email atau password salah", 401);
    }
    // Ambil profileId berdasarkan role
    let profileId = null;
    let name = null;
    if (user.role === "Dokter") {
      const [doctors] = await pool.query(
        "SELECT id, name FROM doctors WHERE user_id = ?",
        [user.id],
      );
      if (doctors.length > 0) {
        profileId = doctors[0].id;
        name = doctors[0].name;
      }
    } else if (user.role === "Pasien") {
      const [patients] = await pool.query(
        "SELECT id, name FROM patients WHERE user_id = ?",
        [user.id],
      );
      if (patients.length > 0) {
        profileId = patients[0].id;
        name = patients[0].name;
      }
    } else {
      // Admin tidak punya profile table, gunakan email sebagai name
      name = "Administrator";
    }
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, profileId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );
    return successResponse(res, "Login berhasil", {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        profileId,
      },
    });
  } catch (error) {
    next(error);
  }
};
/**
 * Get current user info dari token
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.email, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id],
    );
    if (users.length === 0) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }
    const user = users[0];
    let name = null;
    let profileId = req.user.profileId;
    if (user.role === "Dokter") {
      const [doctors] = await pool.query(
        "SELECT id, name FROM doctors WHERE user_id = ?",
        [user.id],
      );
      if (doctors.length > 0) {
        name = doctors[0].name;
        profileId = doctors[0].id;
      }
    } else if (user.role === "Pasien") {
      const [patients] = await pool.query(
        "SELECT id, name FROM patients WHERE user_id = ?",
        [user.id],
      );
      if (patients.length > 0) {
        name = patients[0].name;
        profileId = patients[0].id;
      }
    } else {
      name = "Administrator";
    }
    return successResponse(res, "Data user berhasil diambil", {
      id: user.id,
      email: user.email,
      role: user.role,
      name,
      profileId,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { register, login, getMe };
