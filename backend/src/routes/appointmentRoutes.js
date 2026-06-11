const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, appointmentController.getAll);
router.get('/:id', verifyToken, appointmentController.getById);
router.post('/', verifyToken, allowRoles('Pasien', 'Admin'), appointmentController.create);
router.put('/:id/status', verifyToken, allowRoles('Dokter', 'Admin'), appointmentController.updateStatus);
router.delete('/:id', verifyToken, allowRoles('Admin'), appointmentController.delete);

module.exports = router;
