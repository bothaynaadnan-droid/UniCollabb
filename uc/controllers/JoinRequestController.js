const JoinRequest = require('../models/JoinRequestModel');
const Student = require('../models/StudentModel');
const Project = require('../models/ProjectModel');
const ProjectMember = require('../models/ProjectMembersModel');

const normalizeRole = (raw) => {
  const desired = String(raw || '').toLowerCase();
  if (desired.includes('lead')) return 'leader';
  return 'member';
};

exports.create = async (req, res) => {
  try {
    const { project_id, desired_role, message } = req.body;
    if (!project_id) {
      return res.status(400).json({ success: false, message: 'project_id is required' });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can send join requests' });
    }

    const requesterStudent = await Student.findByUserId(req.user.id);
    if (!requesterStudent?.id) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this account' });
    }

    const project = await Project.getById(project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isAlreadyMember = await ProjectMember.isMember(project_id, requesterStudent.id);
    if (isAlreadyMember) {
      return res.status(409).json({ success: false, message: 'You are already a member of this project' });
    }

    const existing = await JoinRequest.findPendingByProjectAndRequester(project_id, requesterStudent.id);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Join request already pending for this project' });
    }

    const result = await JoinRequest.create({
      project_id,
      requester_student_id: requesterStudent.id,
      desired_role: desired_role || null,
      message: message || null
    });

    res.status(201).json({
      success: true,
      data: { id: result.id },
      message: 'Join request created'
    });
  } catch (error) {
    console.error('Create join request error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid project_id' });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.listInbox = async (req, res) => {
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can view creator inbox' });
    }

    const me = await Student.findByUserId(req.user.id);
    if (!me?.id) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this account' });
    }

    const rows = await JoinRequest.listForCreatorStudent(me.id);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('List join request inbox error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.listForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId is required' });
    }

    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can view project join requests' });
    }

    const me = await Student.findByUserId(req.user.id);
    if (!me?.id) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this account' });
    }

    if (Number(project.creator_id) !== Number(me.id)) {
      return res.status(403).json({ success: false, message: 'Access denied for this project' });
    }

    const rows = await JoinRequest.listForProject(projectId);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('List join requests by project error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const nextStatus = String(status || '').toLowerCase();
    if (!['accepted', 'rejected', 'pending'].includes(nextStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can update join requests' });
    }

    const me = await Student.findByUserId(req.user.id);
    if (!me?.id) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this account' });
    }

    const jr = await JoinRequest.getById(id);
    if (!jr) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    const project = await Project.getById(jr.project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (Number(project.creator_id) !== Number(me.id)) {
      return res.status(403).json({ success: false, message: 'Access denied for this join request' });
    }

    if (nextStatus === 'accepted') {
      const already = await ProjectMember.findByProjectAndStudent(jr.project_id, jr.requester_student_id);
      if (!already) {
        await ProjectMember.create({
          project_id: jr.project_id,
          student_id: jr.requester_student_id,
          role: normalizeRole(jr.desired_role)
        });
      }
    }

    const result = await JoinRequest.updateStatus(id, nextStatus);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    res.json({ success: true, message: 'Join request updated' });
  } catch (error) {
    console.error('Update join request status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
