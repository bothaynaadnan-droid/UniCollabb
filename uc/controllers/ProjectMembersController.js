const ProjectMember = require('../models/ProjectMembersModel');

const validateMemberData = (data) => {
    const errors = [];
    
    const validRoles = ['member', 'leader'];
    if (data.role && !validRoles.includes(data.role)) {
        errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        
        const members = await ProjectMember.getAll(safePage, safeLimit);
        const total = await ProjectMember.getTotalCount();
        
        res.json({
            success: true,
            data: members,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit)
            }
        });
    } catch (error) {
        console.error('Get all project members error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { project_id, student_id, role } = req.body;
        
        if (!project_id || !student_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: project_id, student_id' 
            });
        }

        const validationErrors = validateMemberData({ role });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const existingMember = await ProjectMember.findByProjectAndStudent(project_id, student_id);
        if (existingMember) {
            return res.status(409).json({ 
                success: false,
                message: 'Student is already a member of this project' 
            });
        }

        const result = await ProjectMember.create({ 
            project_id, 
            student_id, 
            role 
        });
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Member added to project successfully' 
        });
    } catch (error) {
        console.error('Add project member error:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Invalid project_id or student_id'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await ProjectMember.getById(id);
        
        if (!member) {
            return res.status(404).json({ 
                success: false,
                message: 'Project member not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: member 
        });
    } catch (error) {
        console.error('Get project member by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getMembersByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const members = await ProjectMember.getMembersByProject(projectId);
        
        const memberCount = await ProjectMember.getMemberCountByProject(projectId);
        
        res.json({ 
            success: true,
            data: members,
            count: memberCount
        });
    } catch (error) {
        console.error('Get project members error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getProjectsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const projects = await ProjectMember.getProjectsByStudent(studentId);
        
        res.json({ 
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('Get student projects error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({ 
                success: false,
                message: 'Role is required' 
            });
        }

        const validationErrors = validateMemberData({ role });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await ProjectMember.update(id, { role });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project member not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Member role updated successfully' 
        });
    } catch (error) {
        console.error('Update project member error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({ 
                success: false,
                message: 'Role is required' 
            });
        }

        const validRoles = ['member', 'leader'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        const result = await ProjectMember.updateRole(id, role);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project member not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Member role updated successfully' 
        });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ProjectMember.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project member not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Member removed from project successfully' 
        });
    } catch (error) {
        console.error('Remove project member error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.removeByProjectAndStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const result = await ProjectMember.deleteByProjectAndStudent(projectId, studentId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project member not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Member removed from project successfully' 
        });
    } catch (error) {
        console.error('Remove project member error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.isMember = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const isMember = await ProjectMember.isMember(projectId, studentId);
        
        res.json({ 
            success: true,
            data: { isMember }
        });
    } catch (error) {
        console.error('Check member status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};