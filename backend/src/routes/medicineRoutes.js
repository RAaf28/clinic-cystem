const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', medicineController.getAll);
router.get('/:id', medicineController.getById);
router.post('/', verifyToken, allowRoles('Admin'), medicineController.create);
router.put('/:id', verifyToken, allowRoles('Admin'), medicineController.update);
router.delete('/:id', verifyToken, allowRoles('Admin'), medicineController.delete);

module.exports = router;
