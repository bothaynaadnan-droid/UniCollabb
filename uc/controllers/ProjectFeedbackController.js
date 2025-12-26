const ProjectFeedback = require('../models/ProjectFeedbackModel');

const validateFeedbackData = (data, isUpdate = false) => {
    const errors = [];
    
    if (!isUpdate && (!data.project_id || !data.supervisor_id)) {
        errors.push('project_id and supervisor_id are required');
    }
    
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
        errors.push('Rating must be between 1 and 5');
    }
    
    const validStatuses = ['draft', 'published', 'archived'];
    if (data.status && !validStatuses.includes(data.status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (data.comments && data.comments.length > 1000) {
        errors.push('Comments must be less than 1000 characters');
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        
        let feedbacks;
        let total = 0;
        
        if (status) {
            feedbacks = await ProjectFeedback.getAllByStatus(status, safePage, safeLimit);
            total = await ProjectFeedback.getCountByStatus(status);
        } else {
            feedbacks = await ProjectFeedback.getAll(safePage, safeLimit);
            total = await ProjectFeedback.getTotalCount();
        }
        
        res.json({
            success: true,
            data: feedbacks,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit)
            }
        });
    } catch (error) {
        console.error('Get all project feedback error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


exports.create = async (req, res) => {
    try {
        const { project_id, supervisor_id, comments, rating, status } = req.body;
        
        if (!project_id || !supervisor_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: project_id, supervisor_id' 
            });
        }

        const validationErrors = validateFeedbackData({ project_id, supervisor_id, rating, status, comments });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const existingFeedback = await ProjectFeedback.findByProjectAndSupervisor(project_id, supervisor_id);
        if (existingFeedback) {
            return res.status(409).json({ 
                success: false,
                message: 'Feedback already exists from this supervisor for this project' 
            });
        }

        const result = await ProjectFeedback.create({ 
            project_id, 
            supervisor_id, 
            comments, 
            rating, 
            status 
        });
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Feedback created successfully' 
        });
    } catch (error) {
        console.error('Create feedback error:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Invalid project_id or supervisor_id'
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
        const feedback = await ProjectFeedback.getById(id);
        
        if (!feedback) {
            return res.status(404).json({ 
                success: false,
                message: 'Feedback not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: feedback 
        });
    } catch (error) {
        console.error('Get feedback by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.query;
        
        let feedbacks = await ProjectFeedback.getByProject(projectId);
        
        if (status) {
            feedbacks = feedbacks.filter(feedback => feedback.status === status);
        }
        
        const averageRating = await ProjectFeedback.getAverageRating(projectId);
        
        res.json({ 
            success: true,
            data: feedbacks,
            averageRating: parseFloat(averageRating) || 0,
            count: feedbacks.length
        });
    } catch (error) {
        console.error('Get project feedback error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getBySupervisor = async (req, res) => {
    try {
        const { supervisorId } = req.params;
        const { status } = req.query;
        
        let feedbacks = await ProjectFeedback.getBySupervisor(supervisorId);
        
        if (status) {
            feedbacks = feedbacks.filter(feedback => feedback.status === status);
        }
        
        const stats = await ProjectFeedback.getSupervisorStats(supervisorId);
        
        res.json({ 
            success: true,
            data: feedbacks,
            stats: stats,
            count: feedbacks.length
        });
    } catch (error) {
        console.error('Get supervisor feedback error:', error);
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
        const { comments, rating, status } = req.body;
        
        const validationErrors = validateFeedbackData({ comments, rating, status }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await ProjectFeedback.update(id, { comments, rating, status });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Feedback not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Feedback updated successfully' 
        });
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
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

        const validationErrors = validateFeedbackData({ status }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await ProjectFeedback.updateStatus(id, status);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Feedback not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Feedback status updated successfully' 
        });
    } catch (error) {
        console.error('Update feedback status error:', error);
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
        const result = await ProjectFeedback.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Feedback not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Feedback deleted successfully' 
        });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};