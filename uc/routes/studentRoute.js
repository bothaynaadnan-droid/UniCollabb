const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');

router.get('/', studentController.getAll);
router.post('/', studentController.create);
router.get('/major/:major', studentController.getByMajor); 
router.get('/user/:userId', studentController.findByUserId);  
router.get('/:id', studentController.getById);
router.put('/:id', studentController.update);
router.delete('/:id', studentController.delete);

module.exports = router;