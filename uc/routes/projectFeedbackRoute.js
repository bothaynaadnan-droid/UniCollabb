const express = require('express');
const router = express.Router();

const projectFeedbackController = require('../controllers/ProjectFeedbackController');
router.get('/', projectFeedbackController.getAll);
router.post('/', projectFeedbackController.create);
router.get('/project/:projectId', projectFeedbackController.getByProject);
router.get('/supervisor/:supervisorId', projectFeedbackController.getBySupervisor);
router.get('/:id', projectFeedbackController.getById);
router.put('/:id', projectFeedbackController.update);
router.patch('/:id/status', projectFeedbackController.updateStatus);
router.delete('/:id', projectFeedbackController.delete);

module.exports = router;