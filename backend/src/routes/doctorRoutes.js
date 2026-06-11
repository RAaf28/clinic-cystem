const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', doctorController.getAll);
router.get('/:id', doctorController.getById);
router.post('/', verifyToken, allowRoles('Admin'), doctorController.create);
router.put('/:id', verifyToken, allowRoles('Admin'), doctorController.update);
router.delete('/:id', verifyToken, allowRoles('Admin'), doctorController.delete);

module.exports = router;
