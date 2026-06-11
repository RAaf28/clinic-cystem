const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/record/:medicalRecordId', verifyToken, prescriptionController.getByMedicalRecord);
router.post('/', verifyToken, allowRoles('Dokter'), prescriptionController.create);
router.delete('/:id', verifyToken, allowRoles('Dokter', 'Admin'), prescriptionController.delete);

module.exports = router;
