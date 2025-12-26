const Supervisor = require('../models/SupervisorModel');


const validateSupervisorData = (data) => {
    const errors = [];
    
    if (data.employee_id && data.employee_id.length < 3) {
        errors.push('Employee ID must be at least 3 characters long');
    }
    
    if (data.department && data.department.length < 2) {
        errors.push('Department must be at least 2 characters long');
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        const { department } = req.query;
        
        let supervisors;
        if (department) {
            supervisors = await Supervisor.getByDepartment(department);
        } else {
            supervisors = await Supervisor.getAll();
        }
        
        res.json({
            success: true,
            data: supervisors,
            count: supervisors.length
        });
    } catch (error) {
        console.error('Get all supervisors error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};


exports.create = async (req, res) => {
    try {
        const { user_id, employee_id, department, specialization } = req.body;
        
        if (!user_id || !employee_id || !department) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: user_id, employee_id, department' 
            });
        }

        const validationErrors = validateSupervisorData({ employee_id, department });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const existingSupervisor = await Supervisor.findByEmployeeId(employee_id);
        if (existingSupervisor) {
            return res.status(409).json({ 
                success: false,
                message: 'Employee ID already exists' 
            });
        }

        const result = await Supervisor.create({ 
            user_id, 
            employee_id, 
            department, 
            specialization: specialization || null 
        });
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Supervisor created successfully' 
        });
    } catch (error) {
        console.error('Create supervisor error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user_id'
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
        const supervisor = await Supervisor.getById(id);
        
        if (!supervisor) {
            return res.status(404).json({ 
                success: false,
                message: 'Supervisor not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: supervisor 
        });
    } catch (error) {
        console.error('Get supervisor by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};


exports.findByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const supervisor = await Supervisor.findByUserId(userId);
        
        if (!supervisor) {
            return res.status(404).json({ 
                success: false,
                message: 'Supervisor not found for this user' 
            });
        }
        
        res.json({ 
            success: true,
            data: supervisor 
        });
    } catch (error) {
        console.error('Get supervisor by user ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { employee_id, department, specialization } = req.body;
        const validationErrors = validateSupervisorData({ employee_id, department });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Supervisor.update(id, { employee_id, department, specialization });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Supervisor not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Supervisor updated successfully' 
        });
    } catch (error) {
        console.error('Update supervisor error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Supervisor.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Supervisor not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Supervisor deleted successfully' 
        });
    } catch (error) {
        console.error('Delete supervisor error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};
exports.getByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const { page = 1, limit = 10 } = req.query;  
        
        if (!department) {
            return res.status(400).json({ 
                success: false,
                message: 'Department parameter is required' 
            });
        }
        const safePage = Math.max(1, Number(page) | 0);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) | 0));
        
        if (isNaN(safePage) || isNaN(safeLimit)) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
        }
        const supervisors = await Supervisor.getByDepartment(department, safePage, safeLimit); 
        
        res.json({ 
            success: true,
            data: supervisors,
            count: supervisors.length,
            department: department,
            pagination: {
                page: safePage,
                limit: safeLimit
            }
        });
    } catch (error) {
        console.error('Get supervisors by department error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};