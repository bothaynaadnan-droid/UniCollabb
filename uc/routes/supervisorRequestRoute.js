const express = require('express');
const router = express.Router();
const controller = require('../controllers/SupervisorRequestController');

router.post('/', controller.create);
router.get('/inbox', controller.listInbox);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
