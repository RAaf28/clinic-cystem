const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, allowRoles('Admin'), paymentController.getAll);
router.get('/stats', verifyToken, allowRoles('Admin'), paymentController.getDashboardStats);
router.get('/:id', verifyToken, paymentController.getById);
router.get('/appointment/:appointmentId', verifyToken, paymentController.getByAppointment);
router.put('/:id/status', verifyToken, allowRoles('Admin'), paymentController.updateStatus);

module.exports = router;
