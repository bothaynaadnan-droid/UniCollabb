const express = require('express');
const router = express.Router();
const projectController = require('../controllers/ProjectController');
const upload = require('../middleware/upload');

router.get('/', projectController.getAll);
router.post('/', upload.single('file'), projectController.create);
router.post('/upload-multiple', upload.array('files', 5), projectController.create);
router.get('/creator/:creatorId', projectController.findByCreator); 
router.get('/supervisor/:supervisorId', projectController.findBySupervisor);
router.get('/status/:status', projectController.findByStatus);
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.patch('/:id/status', projectController.updateStatus);
router.delete('/:id', projectController.delete);

module.exports = router;