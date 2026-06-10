const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', verifyToken, allowRoles('Admin'), departmentController.create);
router.put('/:id', verifyToken, allowRoles('Admin'), departmentController.update);
router.delete('/:id', verifyToken, allowRoles('Admin'), departmentController.delete);

module.exports = router;
