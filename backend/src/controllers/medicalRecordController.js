const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get all medical records (Admin, Dokter)
 */
exports.getAll = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    const [records] = await conn.query(
      `SELECT mr.id, mr.appointment_id, mr.diagnosis, mr.notes, mr.created_at,
              a.patient_id, p.name as patient_name, d.name as doctor_name
       FROM medical_records mr
       JOIN appointments a ON mr.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       ORDER BY mr.created_at DESC`
    );
    conn.release();

    return successResponse(res, 'Medical records retrieved successfully', records);
  } catch (err) {
    next(err);
  }
};

/**
 * Get medical record by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [records] = await conn.query(
      `SELECT mr.id, mr.appointment_id, mr.diagnosis, mr.notes, mr.created_at,
              a.patient_id, p.name as patient_name, d.name as doctor_name
       FROM medical_records mr
       JOIN appointments a ON mr.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE mr.id = ?`,
      [id]
    );
    conn.release();

    if (records.length === 0) {
      return errorResponse(res, 'Medical record not found', 404);
    }

    return successResponse(res, 'Medical record retrieved successfully', records[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Get medical records by patient (Pasien hanya akses miliknya sendiri)
 */
exports.getByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { role, profileId } = req.user;

    // Pasien hanya bisa lihat rekam medis miliknya sendiri
    if (role === 'Pasien' && profileId !== parseInt(patientId)) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    const conn = await pool.getConnection();
    const [records] = await conn.query(
      `SELECT mr.id, mr.appointment_id, mr.diagnosis, mr.notes, mr.created_at,
              a.patient_id, p.name as patient_name, d.name as doctor_name
       FROM medical_records mr
       JOIN appointments a ON mr.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY mr.created_at DESC`,
      [patientId]
    );
    conn.release();

    return successResponse(res, 'Medical records retrieved successfully', records);
  } catch (err) {
    next(err);
  }
};

/**
 * Create medical record (Dokter only)
 * Validasi: appointment_id harus ada dan statusnya bukan 'Batal'
 * Auto-create payment dengan total_amount = 0 (dihitung via prescription nanti)
 */
exports.create = async (req, res, next) => {
  try {
    const { appointment_id, diagnosis, notes } = req.body;

    if (!appointment_id || !diagnosis) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const conn = await pool.getConnection();

    // Check appointment ada dan status bukan Batal
    const [appointments] = await conn.query(
      'SELECT id, patient_id, doctor_id FROM appointments WHERE id = ? AND status != ?',
      [appointment_id, 'Batal']
    );

    if (appointments.length === 0) {
      conn.release();
      return errorResponse(res, 'Invalid appointment or appointment is cancelled', 400);
    }

    // Create medical record
    const [result] = await conn.query(
      'INSERT INTO medical_records (appointment_id, diagnosis, notes) VALUES (?, ?, ?)',
      [appointment_id, diagnosis, notes || null]
    );

    // Auto-create payment entry
    const [paymentResult] = await conn.query(
      `INSERT INTO payments (appointment_id, total_amount, payment_status) 
       VALUES (?, 0, 'Belum Bayar')`,
      [appointment_id]
    );

    // Update appointment status to Selesai
    await conn.query('UPDATE appointments SET status = ? WHERE id = ?', ['Selesai', appointment_id]);

    conn.release();

    return successResponse(res, 'Medical record created successfully', {
      id: result.insertId,
      appointment_id,
      diagnosis,
      notes,
      payment_id: paymentResult.insertId
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update medical record (Dokter only)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diagnosis, notes } = req.body;

    if (!diagnosis) {
      return errorResponse(res, 'Diagnosis required', 400);
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE medical_records SET diagnosis = ?, notes = ? WHERE id = ?',
      [diagnosis, notes || null, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Medical record not found', 404);
    }

    return successResponse(res, 'Medical record updated successfully', {
      id,
      diagnosis,
      notes
    });
  } catch (err) {
    next(err);
  }
};
