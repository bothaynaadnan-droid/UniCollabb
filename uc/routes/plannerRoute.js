const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlannerController');

// Buckets:
// - drafts: array
// - tasks: array
// - events: array
// - whiteboard: object
router.get('/:bucket', controller.getBucket);
router.put('/:bucket', controller.putBucket);

module.exports = router;
