const express = require('express');
const router = express.Router();

const conversationController = require('../controllers/ConversationController');
router.get('/', conversationController.getAll);
router.post('/', conversationController.create);
router.get('/:id', conversationController.getById);
router.get('/user/:userId', conversationController.getByParticipant);
router.get('/creator/:createdBy', conversationController.getByCreator);
router.get('/direct/:user1Id/:user2Id', conversationController.getOrCreateDirect);
router.put('/:id', conversationController.update);
router.delete('/:id', conversationController.delete);
router.get('/:id/participants', conversationController.getParticipants);
router.post('/:id/participants', conversationController.addParticipant);
router.delete('/:id/participants/:userId', conversationController.removeParticipant);

module.exports = router;