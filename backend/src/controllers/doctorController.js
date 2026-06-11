const { pool } = require('../config/db');
const { cache } = require('../config/cache');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all doctors (cached, with department info)
 */
exports.getAll = async (req, res, next) => {
  try {
    const cacheKey = 'all_doctors';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return successResponse(res, 'Doctors retrieved from cache', cached);
    }

    const conn = await pool.getConnection();
    const [doctors] = await conn.query(
      `SELECT d.id, d.user_id, d.name, d.license_number, d.created_at,
              dept.id as department_id, dept.name as department_name
       FROM doctors d
       JOIN departments dept ON d.department_id = dept.id
       ORDER BY d.created_at DESC`
    );
    conn.release();

    cache.set(cacheKey, doctors, 300);
    return successResponse(res, 'Doctors retrieved successfully', doctors);
  } catch (err) {
    next(err);
  }
};

/**
 * Get doctor by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [doctors] = await conn.query(
      `SELECT d.id, d.user_id, d.name, d.license_number, d.created_at,
              dept.id as department_id, dept.name as department_name
       FROM doctors d
       JOIN departments dept ON d.department_id = dept.id
       WHERE d.id = ?`,
      [id]
    );
    conn.release();

    if (doctors.length === 0) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    return successResponse(res, 'Doctor retrieved successfully', doctors[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create new doctor (Admin only) - creates user + doctor entry
 */
exports.create = async (req, res, next) => {
  try {
    const { email, password, name, license_number, department_id } = req.body;
    
    if (!email || !password || !name || !license_number || !department_id) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const conn = await pool.getConnection();
    
    // Check email not exist
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return errorResponse(res, 'Email already registered', 400);
    }

    // Create user with role_id = 2 (Dokter)
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    
    const [userResult] = await conn.query(
      'INSERT INTO users (role_id, email, password) VALUES (2, ?, ?)',
      [email, hashed]
    );

    // Create doctor entry
    const [doctorResult] = await conn.query(
      'INSERT INTO doctors (user_id, name, license_number, department_id) VALUES (?, ?, ?, ?)',
      [userResult.insertId, name, license_number, department_id]
    );

    conn.release();
    cache.del('all_doctors');

    return successResponse(res, 'Doctor created successfully', {
      id: doctorResult.insertId,
      user_id: userResult.insertId,
      name,
      license_number,
      department_id,
      email
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update doctor (Admin only)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, license_number, department_id } = req.body;

    if (!name || !license_number || !department_id) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE doctors SET name = ?, license_number = ?, department_id = ? WHERE id = ?',
      [name, license_number, department_id, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    cache.del('all_doctors');
    return successResponse(res, 'Doctor updated successfully', {
      id,
      name,
      license_number,
      department_id
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete doctor (Admin only)
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    const [result] = await conn.query('DELETE FROM doctors WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    cache.del('all_doctors');
    return successResponse(res, 'Doctor deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
