const express = require('express');
const router = express.Router();
const controller = require('../controllers/JoinRequestController');

router.post('/', controller.create);
router.get('/inbox', controller.listInbox);
router.get('/project/:projectId', controller.listForProject);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
