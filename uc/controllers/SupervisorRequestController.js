const SupervisorRequest = require('../models/SupervisorRequestModel');
const Student = require('../models/StudentModel');
const Supervisor = require('../models/SupervisorModel');
const Project = require('../models/ProjectModel');

exports.create = async (req, res) => {
  try {
    const { project_id, supervisor_id, message } = req.body;
    if (!project_id || !supervisor_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields: project_id, supervisor_id' });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can send supervision requests' });
    }

    const me = await Student.findByUserId(req.user.id);
    if (!me?.id) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this account' });
    }

    const project = await Project.getById(project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (Number(project.creator_id) !== Number(me.id)) {
      return res.status(403).json({ success: false, message: 'Access denied for this project' });
    }

    const sup = await Supervisor.getById(supervisor_id);
    if (!sup?.id) {
      return res.status(400).json({ success: false, message: 'Invalid supervisor_id' });
    }

    const existing = await SupervisorRequest.findPendingByProjectAndSupervisor(project_id, supervisor_id);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Supervision request already pending' });
    }

    const result = await SupervisorRequest.create({ project_id, supervisor_id, message: message || null });
    res.status(201).json({ success: true, data: { id: result.id }, message: 'Supervision request created' });
  } catch (error) {
    console.error('Create supervisor request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.listInbox = async (req, res) => {
  try {
    if (req.user?.role !== 'supervisor') {
      return res.status(403).json({ success: false, message: 'Only supervisors can view supervision requests' });
    }

    const sup = await Supervisor.findByUserId(req.user.id);
    if (!sup?.id) {
      return res.status(400).json({ success: false, message: 'Supervisor profile not found for this account' });
    }

    const rows = await SupervisorRequest.listForSupervisor(sup.id);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('List supervisor request inbox error:', error);
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

    if (req.user?.role !== 'supervisor') {
      return res.status(403).json({ success: false, message: 'Only supervisors can update supervision requests' });
    }

    const sup = await Supervisor.findByUserId(req.user.id);
    if (!sup?.id) {
      return res.status(400).json({ success: false, message: 'Supervisor profile not found for this account' });
    }

    const sr = await SupervisorRequest.getById(id);
    if (!sr) {
      return res.status(404).json({ success: false, message: 'Supervision request not found' });
    }

    if (Number(sr.supervisor_id) !== Number(sup.id)) {
      return res.status(403).json({ success: false, message: 'Access denied for this request' });
    }

    if (nextStatus === 'accepted') {
      await Project.updateSupervisor(sr.project_id, sup.id);
    }

    const result = await SupervisorRequest.updateStatus(id, nextStatus);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Supervision request not found' });
    }

    res.json({ success: true, message: 'Supervision request updated' });
  } catch (error) {
    console.error('Update supervisor request status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
