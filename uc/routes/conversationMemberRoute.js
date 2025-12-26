const express = require('express');
const router = express.Router();

const conversationMemberController = require('../controllers/ConversationMemberController');
router.get('/conversation/:conversationId/user/:userId/status', conversationMemberController.isMember);
router.get('/conversation/:conversationId/admins', conversationMemberController.getAdmins);
router.patch('/conversation/:conversationId/user/:userId/leave', conversationMemberController.leaveByConversationAndUser);
router.delete('/conversation/:conversationId/user/:userId', conversationMemberController.removeByConversationAndUser);
router.get('/conversation/:conversationId', conversationMemberController.getByConversation);
router.get('/user/:userId', conversationMemberController.getByUser);
router.patch('/:id/role', conversationMemberController.updateRole);
router.patch('/:id/leave', conversationMemberController.leaveConversation);
router.get('/', conversationMemberController.getAll);
router.post('/', conversationMemberController.create);
router.get('/:id', conversationMemberController.getById);
router.delete('/:id', conversationMemberController.removeMember);

module.exports = router;