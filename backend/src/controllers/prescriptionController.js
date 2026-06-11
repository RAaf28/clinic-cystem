const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get prescriptions by medical record ID
 */
exports.getByMedicalRecord = async (req, res, next) => {
  try {
    const { medicalRecordId } = req.params;
    const conn = await pool.getConnection();
    const [prescriptions] = await conn.query(
      `SELECT pr.id, pr.medical_record_id, pr.quantity, pr.dosage, pr.created_at,
              m.id as medicine_id, m.name as medicine_name, m.price
       FROM prescriptions pr
       JOIN medicines m ON pr.medicine_id = m.id
       WHERE pr.medical_record_id = ?
       ORDER BY pr.created_at DESC`,
      [medicalRecordId]
    );
    conn.release();

    return successResponse(res, 'Prescriptions retrieved successfully', prescriptions);
  } catch (err) {
    next(err);
  }
};

/**
 * Create prescription (Dokter only)
 * Validasi: stok obat cukup
 * Kurangi stok obat
 * Update total payment
 */
exports.create = async (req, res, next) => {
  try {
    const { medical_record_id, medicine_id, quantity, dosage } = req.body;

    if (!medical_record_id || !medicine_id || !quantity) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const conn = await pool.getConnection();

    // Check stok obat cukup
    const [medicines] = await conn.query(
      'SELECT stock, price FROM medicines WHERE id = ?',
      [medicine_id]
    );

    if (medicines.length === 0) {
      conn.release();
      return errorResponse(res, 'Medicine not found', 404);
    }

    if (medicines[0].stock < quantity) {
      conn.release();
      return errorResponse(res, 'Insufficient medicine stock', 400);
    }

    // Create prescription
    const [result] = await conn.query(
      'INSERT INTO prescriptions (medical_record_id, medicine_id, quantity, dosage) VALUES (?, ?, ?, ?)',
      [medical_record_id, medicine_id, quantity, dosage || null]
    );

    // Kurangi stok obat
    await conn.query(
      'UPDATE medicines SET stock = stock - ? WHERE id = ?',
      [quantity, medicine_id]
    );

    // Get appointment_id dari medical_record
    const [medicalRecords] = await conn.query(
      'SELECT appointment_id FROM medical_records WHERE id = ?',
      [medical_record_id]
    );

    if (medicalRecords.length > 0) {
      const appointmentId = medicalRecords[0].appointment_id;

      // Hitung total payment
      const [totalResult] = await conn.query(
        `SELECT SUM(p.quantity * m.price) as total
         FROM prescriptions p
         JOIN medicines m ON p.medicine_id = m.id
         WHERE p.medical_record_id = ?`,
        [medical_record_id]
      );

      const totalAmount = totalResult[0].total || 0;

      // Update payment
      await conn.query(
        'UPDATE payments SET total_amount = ? WHERE appointment_id = ?',
        [totalAmount, appointmentId]
      );
    }

    conn.release();

    return successResponse(res, 'Prescription created successfully', {
      id: result.insertId,
      medical_record_id,
      medicine_id,
      quantity,
      dosage
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete prescription (Dokter, Admin only)
 * Kembalikan stok obat
 * Update total payment
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();

    // Get prescription details
    const [prescriptions] = await conn.query(
      'SELECT medical_record_id, medicine_id, quantity FROM prescriptions WHERE id = ?',
      [id]
    );

    if (prescriptions.length === 0) {
      conn.release();
      return errorResponse(res, 'Prescription not found', 404);
    }

    const { medical_record_id, medicine_id, quantity } = prescriptions[0];

    // Delete prescription
    await conn.query('DELETE FROM prescriptions WHERE id = ?', [id]);

    // Kembalikan stok obat
    await conn.query(
      'UPDATE medicines SET stock = stock + ? WHERE id = ?',
      [quantity, medicine_id]
    );

    // Get appointment_id dari medical_record
    const [medicalRecords] = await conn.query(
      'SELECT appointment_id FROM medical_records WHERE id = ?',
      [medical_record_id]
    );

    if (medicalRecords.length > 0) {
      const appointmentId = medicalRecords[0].appointment_id;

      // Hitung total payment baru
      const [totalResult] = await conn.query(
        `SELECT SUM(p.quantity * m.price) as total
         FROM prescriptions p
         JOIN medicines m ON p.medicine_id = m.id
         WHERE p.medical_record_id = ?`,
        [medical_record_id]
      );

      const totalAmount = totalResult[0].total || 0;

      // Update payment
      await conn.query(
        'UPDATE payments SET total_amount = ? WHERE appointment_id = ?',
        [totalAmount, appointmentId]
      );
    }

    conn.release();
    return successResponse(res, 'Prescription deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
