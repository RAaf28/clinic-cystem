const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all users (Admin only)
 */
exports.getAll = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    const [users] = await conn.query(
      `SELECT u.id, u.role_id, u.email, u.created_at,
              r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );
    conn.release();

    return successResponse(res, 'Users retrieved successfully', users);
  } catch (err) {
    next(err);
  }
};

/**
 * Get user by ID (Admin only)
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [users] = await conn.query(
      `SELECT u.id, u.role_id, u.email, u.created_at,
              r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );
    conn.release();

    if (users.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User retrieved successfully', users[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete user (Admin only)
 * Tidak boleh hapus diri sendiri
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Cek tidak hapus diri sendiri
    if (parseInt(id) === userId) {
      return errorResponse(res, 'Cannot delete your own account', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query('DELETE FROM users WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
