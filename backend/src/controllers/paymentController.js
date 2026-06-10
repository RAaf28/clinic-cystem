const { pool } = require('../config/db');
const cache = require('../config/cache');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all payments (Admin only)
 */
exports.getAll = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    const [payments] = await conn.query(
      `SELECT py.id, py.appointment_id, py.total_amount, py.payment_status, py.paid_at, py.created_at,
              a.patient_id, p.name as patient_name, d.name as doctor_name
       FROM payments py
       JOIN appointments a ON py.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       ORDER BY py.created_at DESC`
    );
    conn.release();

    return successResponse(res, 'Payments retrieved successfully', payments);
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [payments] = await conn.query(
      `SELECT py.id, py.appointment_id, py.total_amount, py.payment_status, py.paid_at, py.created_at,
              a.patient_id, p.name as patient_name, d.name as doctor_name
       FROM payments py
       JOIN appointments a ON py.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE py.id = ?`,
      [id]
    );
    conn.release();

    if (payments.length === 0) {
      return errorResponse(res, 'Payment not found', 404);
    }

    return successResponse(res, 'Payment retrieved successfully', payments[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment by appointment ID
 */
exports.getByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const conn = await pool.getConnection();
    const [payments] = await conn.query(
      `SELECT py.id, py.appointment_id, py.total_amount, py.payment_status, py.paid_at, py.created_at,
              a.patient_id, p.name as patient_name, d.name as doctor_name
       FROM payments py
       JOIN appointments a ON py.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE py.appointment_id = ?`,
      [appointmentId]
    );
    conn.release();

    if (payments.length === 0) {
      return errorResponse(res, 'Payment not found', 404);
    }

    return successResponse(res, 'Payment retrieved successfully', payments[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Update payment status (Admin only)
 * Ubah 'Belum Bayar' → 'Lunas' dan set paid_at
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status || !['Belum Bayar', 'Lunas'].includes(payment_status)) {
      return errorResponse(res, 'Invalid payment status', 400);
    }

    const conn = await pool.getConnection();
    const paidAt = payment_status === 'Lunas' ? new Date() : null;

    const [result] = await conn.query(
      'UPDATE payments SET payment_status = ?, paid_at = ? WHERE id = ?',
      [payment_status, paidAt, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Payment not found', 404);
    }

    cache.del('dashboard_stats');
    return successResponse(res, 'Payment status updated successfully', {
      id,
      payment_status,
      paid_at: paidAt
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get dashboard stats (Admin only) - cached
 * Return: total_pendapatan, total_transaksi, transaksi_bulan_ini
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const cacheKey = 'dashboard_stats';
    const cached = cache.get(cacheKey);

    if (cached) {
      return successResponse(res, 'Dashboard stats retrieved from cache', cached);
    }

    const conn = await pool.getConnection();

    // Total pendapatan (semua payment yang lunas)
    const [totalResult] = await conn.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE payment_status = ?',
      ['Lunas']
    );

    // Total transaksi
    const [countResult] = await conn.query('SELECT COUNT(*) as count FROM payments');

    // Transaksi bulan ini
    const [monthResult] = await conn.query(
      `SELECT COUNT(*) as count FROM payments 
       WHERE payment_status = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
      ['Lunas']
    );

    conn.release();

    const stats = {
      total_pendapatan: parseFloat(totalResult[0].total),
      total_transaksi: countResult[0].count,
      transaksi_bulan_ini: monthResult[0].count
    };

    cache.set(cacheKey, stats, 120);
    return successResponse(res, 'Dashboard stats retrieved successfully', stats);
  } catch (err) {
    next(err);
  }
};
