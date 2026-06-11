const { pool } = require('../config/db');

/**
 * Check appointment conflict untuk dokter di jam tertentu
 */
exports.checkDoctorConflict = async (doctorId, scheduleDate) => {
  const conn = await pool.getConnection();
  const [conflicting] = await conn.query(
    `SELECT id FROM appointments 
     WHERE doctor_id = ? AND DATE(schedule_date) = DATE(?) 
     AND TIME(schedule_date) = TIME(?) AND status != 'Batal'`,
    [doctorId, scheduleDate, scheduleDate]
  );
  conn.release();

  return conflicting.length > 0;
};

/**
 * Get appointment dengan detail lengkap (dokter, pasien, medical record, payment)
 */
exports.getAppointmentDetail = async (appointmentId) => {
  const conn = await pool.getConnection();

  const [appointments] = await conn.query(
    `SELECT a.id, a.patient_id, a.doctor_id, a.schedule_date, a.status,
            p.name as patient_name, d.name as doctor_name,
            dept.name as department_name
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN departments dept ON d.department_id = dept.id
     WHERE a.id = ?`,
    [appointmentId]
  );

  if (appointments.length === 0) {
    conn.release();
    return null;
  }

  const appointment = appointments[0];

  // Get medical record jika ada
  const [records] = await conn.query(
    'SELECT * FROM medical_records WHERE appointment_id = ?',
    [appointmentId]
  );

  // Get payment
  const [payments] = await conn.query(
    'SELECT * FROM payments WHERE appointment_id = ?',
    [appointmentId]
  );

  conn.release();

  return {
    ...appointment,
    medical_record: records[0] || null,
    payment: payments[0] || null
  };
};

/**
 * Get doctor schedule (appointments untuk dokter tertentu)
 */
exports.getDoctorSchedule = async (doctorId, date = null) => {
  const conn = await pool.getConnection();

  let query = `SELECT a.id, a.schedule_date, a.status, 
                      p.name as patient_name
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE a.doctor_id = ? AND a.status != 'Batal'`;
  let params = [doctorId];

  if (date) {
    query += ' AND DATE(a.schedule_date) = ?';
    params.push(date);
  }

  query += ' ORDER BY a.schedule_date ASC';

  const [schedule] = await conn.query(query, params);
  conn.release();

  return schedule;
};
