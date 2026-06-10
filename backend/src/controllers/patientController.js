const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all patients (Admin, Dokter only)
 */
exports.getAll = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    const [patients] = await conn.query(
      `SELECT p.id, p.user_id, p.name, p.date_of_birth, p.address, p.created_at,
              u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    conn.release();

    return successResponse(res, 'Patients retrieved successfully', patients);
  } catch (err) {
    next(err);
  }
};

/**
 * Get patient by ID (with ownership check for Pasien)
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, profileId } = req.user;

    // Pasien hanya bisa lihat data diri sendiri
    if (role === 'Pasien' && profileId !== parseInt(id)) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    const conn = await pool.getConnection();
    const [patients] = await conn.query(
      `SELECT p.id, p.user_id, p.name, p.date_of_birth, p.address, p.created_at,
              u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    conn.release();

    if (patients.length === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, 'Patient retrieved successfully', patients[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create new patient (Admin only) - creates user + patient entry
 */
exports.create = async (req, res, next) => {
  try {
    const { email, password, name, date_of_birth, address } = req.body;

    if (!email || !password || !name) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const conn = await pool.getConnection();

    // Check email not exist
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return errorResponse(res, 'Email already registered', 400);
    }

    // Create user with role_id = 3 (Pasien)
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);

    const [userResult] = await conn.query(
      'INSERT INTO users (role_id, email, password) VALUES (3, ?, ?)',
      [email, hashed]
    );

    // Create patient entry
    const [patientResult] = await conn.query(
      'INSERT INTO patients (user_id, name, date_of_birth, address) VALUES (?, ?, ?, ?)',
      [userResult.insertId, name, date_of_birth || null, address || null]
    );

    conn.release();

    return successResponse(res, 'Patient created successfully', {
      id: patientResult.insertId,
      user_id: userResult.insertId,
      name,
      date_of_birth,
      address,
      email
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update patient (Admin or Pasien ybs only)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, date_of_birth, address } = req.body;
    const { role, profileId } = req.user;

    // Pasien hanya bisa edit data diri sendiri
    if (role === 'Pasien' && profileId !== parseInt(id)) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    if (!name) {
      return errorResponse(res, 'Patient name required', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE patients SET name = ?, date_of_birth = ?, address = ? WHERE id = ?',
      [name, date_of_birth || null, address || null, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, 'Patient updated successfully', {
      id,
      name,
      date_of_birth,
      address
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete patient (Admin only)
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();

    const [result] = await conn.query('DELETE FROM patients WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, 'Patient deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
