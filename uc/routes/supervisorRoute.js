const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/SupervisorController');

router.get('/', supervisorController.getAll);
router.post('/', supervisorController.create);
router.get('/department/:department', supervisorController.getByDepartment); 
router.get('/:id', supervisorController.getById);
router.get('/user/:userId', supervisorController.findByUserId);
router.put('/:id', supervisorController.update);
router.delete('/:id', supervisorController.delete);

module.exports = router;
