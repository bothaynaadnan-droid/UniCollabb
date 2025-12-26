const express = require('express');
const router = express.Router();

const messageController = require('../controllers/MessageController');
router.get('/', messageController.getAll);
router.post('/', messageController.create);
router.get('/conversation/:conversationId', messageController.getByConversation);
router.get('/conversation/:conversationId/search', messageController.searchInConversation);
router.get('/sender/:senderId', messageController.getBySender);
router.get('/:id', messageController.getById);
router.put('/:id', messageController.update);
router.delete('/:id', messageController.delete);
router.patch('/:id/read', messageController.markAsRead);
router.patch('/conversation/:conversationId/read', messageController.markConversationAsRead);

module.exports = router;