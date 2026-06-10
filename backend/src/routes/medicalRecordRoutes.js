const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, allowRoles('Admin', 'Dokter'), medicalRecordController.getAll);
router.get('/:id', verifyToken, medicalRecordController.getById);
router.get('/patient/:patientId', verifyToken, medicalRecordController.getByPatient);
router.post('/', verifyToken, allowRoles('Dokter'), medicalRecordController.create);
router.put('/:id', verifyToken, allowRoles('Dokter'), medicalRecordController.update);

module.exports = router;
