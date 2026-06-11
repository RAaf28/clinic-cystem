const { pool } = require('../config/db');
const { cache } = require('../config/cache');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all departments (cached)
 */
exports.getAll = async (req, res, next) => {
  try {
    const cacheKey = 'all_departments';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return successResponse(res, 'Departments retrieved from cache', cached);
    }

    const conn = await pool.getConnection();
    const [departments] = await conn.query('SELECT * FROM departments ORDER BY created_at DESC');
    conn.release();

    cache.set(cacheKey, departments, 600);
    return successResponse(res, 'Departments retrieved successfully', departments);
  } catch (err) {
    next(err);
  }
};

/**
 * Get department by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [departments] = await conn.query('SELECT * FROM departments WHERE id = ?', [id]);
    conn.release();

    if (departments.length === 0) {
      return errorResponse(res, 'Department not found', 404);
    }

    return successResponse(res, 'Department retrieved successfully', departments[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create new department (Admin only)
 */
exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return errorResponse(res, 'Department name required', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    conn.release();

    cache.del('all_departments');
    return successResponse(res, 'Department created successfully', { id: result.insertId, name, description }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update department (Admin only)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return errorResponse(res, 'Department name required', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Department not found', 404);
    }

    cache.del('all_departments');
    return successResponse(res, 'Department updated successfully', { id, name, description });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete department (Admin only)
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    const [result] = await conn.query('DELETE FROM departments WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Department not found', 404);
    }

    cache.del('all_departments');
    return successResponse(res, 'Department deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
