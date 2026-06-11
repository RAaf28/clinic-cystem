const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all appointments (with role-based filtering)
 */
exports.getAll = async (req, res, next) => {
  try {
    const { role, profileId } = req.user;
    const { status, date } = req.query;
    
    let query = `SELECT a.id, a.patient_id, a.doctor_id, a.schedule_date, a.status,
                        p.name as patient_name, d.name as doctor_name, a.created_at
                 FROM appointments a
                 JOIN patients p ON a.patient_id = p.id
                 JOIN doctors d ON a.doctor_id = d.id
                 WHERE 1=1`;
    let params = [];

    // Role-based filtering
    if (role === 'Pasien') {
      query += ' AND a.patient_id = ?';
      params.push(profileId);
    } else if (role === 'Dokter') {
      query += ' AND a.doctor_id = ?';
      params.push(profileId);
    }

    // Status filter
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    // Date filter
    if (date) {
      query += ' AND DATE(a.schedule_date) = ?';
      params.push(date);
    }

    query += ' ORDER BY a.schedule_date DESC';

    const conn = await pool.getConnection();
    const [appointments] = await conn.query(query, params);
    conn.release();

    return successResponse(res, 'Appointments retrieved successfully', appointments);
  } catch (err) {
    next(err);
  }
};

/**
 * Get appointment by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [appointments] = await conn.query(
      `SELECT a.id, a.patient_id, a.doctor_id, a.schedule_date, a.status,
              p.name as patient_name, d.name as doctor_name, a.created_at
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [id]
    );
    conn.release();

    if (appointments.length === 0) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    return successResponse(res, 'Appointment retrieved successfully', appointments[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create appointment (Pasien, Admin only)
 * Validasi: schedule_date tidak boleh di masa lalu
 * Validasi: dokter tidak punya appointment lain di jam yang sama
 */
exports.create = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, schedule_date } = req.body;
    const { role, profileId } = req.user;

    if (!patient_id || !doctor_id || !schedule_date) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Pasien hanya bisa buat appointment untuk diri sendiri
    if (role === 'Pasien' && profileId !== parseInt(patient_id)) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    // Validasi schedule_date tidak di masa lalu
    const now = new Date();
    const appointmentDate = new Date(schedule_date);
    if (appointmentDate < now) {
      return errorResponse(res, 'Cannot create appointment in the past', 400);
    }

    const conn = await pool.getConnection();

    // Check dokter tidak punya appointment lain di jam yang sama
    const [conflicting] = await conn.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND DATE(schedule_date) = DATE(?) 
       AND TIME(schedule_date) = TIME(?) AND status != 'Batal'`,
      [doctor_id, schedule_date, schedule_date]
    );

    if (conflicting.length > 0) {
      conn.release();
      return errorResponse(res, 'Doctor has conflicting appointment at this time', 400);
    }

    // Create appointment
    const [result] = await conn.query(
      `INSERT INTO appointments (patient_id, doctor_id, schedule_date, status) 
       VALUES (?, ?, ?, 'Pending')`,
      [patient_id, doctor_id, schedule_date]
    );

    conn.release();

    return successResponse(res, 'Appointment created successfully', {
      id: result.insertId,
      patient_id,
      doctor_id,
      schedule_date,
      status: 'Pending'
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update appointment status (Dokter, Admin only)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Selesai', 'Batal'].includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    return successResponse(res, 'Appointment status updated successfully', { id, status });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete appointment (Admin only)
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();

    const [result] = await conn.query('DELETE FROM appointments WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    return successResponse(res, 'Appointment deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
