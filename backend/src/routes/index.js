const authRoutes = require('./authRoutes');
const departmentRoutes = require('./departmentRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');
const medicineRoutes = require('./medicineRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/medical-records', medicalRecordRoutes);
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/users', userRoutes);
};
