const { pool } = require('../config/db');
const { cache } = require('../config/cache');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all medicines (cached)
 */
exports.getAll = async (req, res, next) => {
  try {
    const cacheKey = 'all_medicines';
    const cached = cache.get(cacheKey);

    if (cached) {
      return successResponse(res, 'Medicines retrieved from cache', cached);
    }

    const conn = await pool.getConnection();
    const [medicines] = await conn.query('SELECT * FROM medicines ORDER BY created_at DESC');
    conn.release();

    cache.set(cacheKey, medicines, 300);
    return successResponse(res, 'Medicines retrieved successfully', medicines);
  } catch (err) {
    next(err);
  }
};

/**
 * Get medicine by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [medicines] = await conn.query('SELECT * FROM medicines WHERE id = ?', [id]);
    conn.release();

    if (medicines.length === 0) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    return successResponse(res, 'Medicine retrieved successfully', medicines[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create medicine (Admin only)
 */
exports.create = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || !price) {
      return errorResponse(res, 'Name and price required', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO medicines (name, price, stock) VALUES (?, ?, ?)',
      [name, price, stock || 0]
    );
    conn.release();

    cache.del('all_medicines');
    return successResponse(res, 'Medicine created successfully', {
      id: result.insertId,
      name,
      price,
      stock: stock || 0
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update medicine (Admin only)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    if (!name || price === undefined) {
      return errorResponse(res, 'Name and price required', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE medicines SET name = ?, price = ?, stock = ? WHERE id = ?',
      [name, price, stock || 0, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    cache.del('all_medicines');
    return successResponse(res, 'Medicine updated successfully', {
      id,
      name,
      price,
      stock: stock || 0
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete medicine (Admin only)
 * Check jika masih ada di prescriptions aktif
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();

    // Check ada di prescriptions
    const [prescriptions] = await conn.query(
      `SELECT COUNT(*) as count FROM prescriptions 
       WHERE medicine_id = ?`,
      [id]
    );

    if (prescriptions[0].count > 0) {
      conn.release();
      return errorResponse(res, 'Cannot delete medicine - still in use in prescriptions', 400);
    }

    const [result] = await conn.query('DELETE FROM medicines WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    cache.del('all_medicines');
    return successResponse(res, 'Medicine deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
