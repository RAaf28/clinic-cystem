const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, allowRoles('Admin', 'Dokter'), patientController.getAll);
router.get('/:id', verifyToken, patientController.getById);
router.post('/', verifyToken, allowRoles('Admin'), patientController.create);
router.put('/:id', verifyToken, allowRoles('Admin', 'Pasien'), patientController.update);
router.delete('/:id', verifyToken, allowRoles('Admin'), patientController.delete);

module.exports = router;
