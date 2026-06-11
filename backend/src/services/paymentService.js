const { pool } = require('../config/db');

/**
 * Calculate total payment dari prescriptions
 */
exports.calculateTotalPayment = async (medicalRecordId) => {
  const conn = await pool.getConnection();

  const [total] = await conn.query(
    `SELECT SUM(p.quantity * m.price) as total
     FROM prescriptions p
     JOIN medicines m ON p.medicine_id = m.id
     WHERE p.medical_record_id = ?`,
    [medicalRecordId]
  );

  conn.release();
  return total[0].total || 0;
};

/**
 * Get payment statistics
 */
exports.getPaymentStats = async () => {
  const conn = await pool.getConnection();

  // Total pendapatan (semua payment yang lunas)
  const [totalRevenue] = await conn.query(
    'SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE payment_status = ?',
    ['Lunas']
  );

  // Total transaksi
  const [totalTransaction] = await conn.query('SELECT COUNT(*) as count FROM payments');

  // Transaksi bulan ini
  const [monthTransaction] = await conn.query(
    `SELECT COUNT(*) as count FROM payments 
     WHERE payment_status = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
    ['Lunas']
  );

  // Transaksi belum bayar
  const [unpaidTransaction] = await conn.query(
    'SELECT COUNT(*) as count FROM payments WHERE payment_status = ?',
    ['Belum Bayar']
  );

  conn.release();

  return {
    total_pendapatan: parseFloat(totalRevenue[0].total),
    total_transaksi: totalTransaction[0].count,
    transaksi_bulan_ini: monthTransaction[0].count,
    transaksi_belum_bayar: unpaidTransaction[0].count
  };
};

/**
 * Get payment history untuk pasien tertentu
 */
exports.getPatientPaymentHistory = async (patientId) => {
  const conn = await pool.getConnection();

  const [payments] = await conn.query(
    `SELECT py.id, py.appointment_id, py.total_amount, py.payment_status, py.paid_at,
            a.schedule_date, d.name as doctor_name
     FROM payments py
     JOIN appointments a ON py.appointment_id = a.id
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.patient_id = ?
     ORDER BY py.created_at DESC`,
    [patientId]
  );

  conn.release();
  return payments;
};
