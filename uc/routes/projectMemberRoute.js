const express = require('express');
const router = express.Router();
const projectMemberController = require('../controllers/ProjectMembersController');

router.get('/', projectMemberController.getAll);
router.post('/', projectMemberController.create);
router.get('/project/:projectId', projectMemberController.getMembersByProject);
router.get('/student/:studentId/projects', projectMemberController.getProjectsByStudent);
router.get('/:id', projectMemberController.getById);
router.put('/:id/role', projectMemberController.updateRole);
router.delete('/:id', projectMemberController.delete);
router.delete('/project/:projectId/student/:studentId', projectMemberController.removeByProjectAndStudent);
router.get('/project/:projectId/student/:studentId/status', projectMemberController.isMember);

module.exports = router;