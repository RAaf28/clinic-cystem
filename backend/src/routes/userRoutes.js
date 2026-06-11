const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, allowRoles('Admin'), userController.getAll);
router.get('/:id', verifyToken, allowRoles('Admin'), userController.getById);
router.delete('/:id', verifyToken, allowRoles('Admin'), userController.delete);

module.exports = router;
