const Project = require('../models/ProjectModel');
const fs = require('fs');

const validateProjectData = (data, isUpdate = false) => {
    const errors = [];
    
    if (!isUpdate && (!data.title || data.title.length < 3)) {
        errors.push('Title is required and must be at least 3 characters long');
    }
    
    if (data.deadline && new Date(data.deadline) < new Date()) {
        errors.push('Deadline cannot be in the past');
    }
    
    const validStatuses = ['planning', 'pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    const validVisibility = ['public', 'private', 'university'];
    if (data.visibility && !validVisibility.includes(data.visibility)) {
        errors.push(`Visibility must be one of: ${validVisibility.join(', ')}`);
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        const { status, visibility, supervisor_id } = req.query;
        
        let projects;
        if (status) {
            projects = await Project.findByStatus(status);
        } else if (visibility) {
            projects = await Project.getAll(visibility);
        } else if (supervisor_id) {
            projects = await Project.findBySupervisor(supervisor_id);
        } else {
            projects = await Project.getAll();
        }
        
        res.json({
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('Get all projects error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, description, creator_id, supervisor_id, status, deadline, requirements, visibility } = req.body;
        
        if (!title || !creator_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: title, creator_id' 
            });
        }

        const validationErrors = validateProjectData({ title, status, deadline, visibility });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        
        let filePath = null;
        if (req.file) {
            filePath = req.file.path; 
            console.log(' File uploaded:', req.file.filename);
        }

        const result = await Project.create({ 
            title, 
            description, 
            creator_id, 
            supervisor_id, 
            status, 
            deadline, 
            requirements, 
            visibility,
            file_path: filePath 
        });
        
        res.status(201).json({ 
            success: true,
            data: { 
                id: result.id,
                file: req.file ? {
                    filename: req.file.filename,
                    path: req.file.path,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                } : null
            },
            message: 'Project created successfully' 
        });
    } catch (error) {
        console.error('Create project error:', error);
        
        
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                success: false,
                message: 'Invalid creator_id or supervisor_id'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.getById(id);
        
        if (!project) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: project 
        });
    } catch (error) {
        console.error('Get project by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.findByCreator = async (req, res) => {
    try {
        const { creatorId } = req.params;
        const projects = await Project.findByCreator(creatorId);
        
        res.json({ 
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('Get projects by creator error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.findBySupervisor = async (req, res) => {
    try {
        const { supervisorId } = req.params;
        const projects = await Project.findBySupervisor(supervisorId);
        
        res.json({ 
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('Get projects by supervisor error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, deadline, requirements, visibility } = req.body;
        
        const validationErrors = validateProjectData({ title, status, deadline, visibility }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Project.update(id, { 
            title, description, status, deadline, requirements, visibility 
        });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Project updated successfully' 
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ 
                success: false,
                message: 'Status is required' 
            });
        }

        const validationErrors = validateProjectData({ status }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Project.updateStatus(id, status);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Project status updated successfully' 
        });
    } catch (error) {
        console.error('Update project status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Project.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Project deleted successfully' 
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};
exports.findByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;  
        
        if (!status) {
            return res.status(400).json({ 
                success: false,
                message: 'Status parameter is required' 
            });
        }
        const safePage = Math.max(1, Number(page) | 0);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) | 0));
        
        const projects = await Project.findByStatus(status, safePage, safeLimit);
        
        res.json({ 
            success: true,
            data: projects,
            count: projects.length,
            status: status,
            pagination: { page: safePage, limit: safeLimit }
        });
    } catch (error) {
        console.error('Get projects by status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};