const Student = require('../models/StudentModel');

const validateStudentData = (data) => {
    const errors = [];
    
    if (data.gpa && (data.gpa < 0 || data.gpa > 4.0)) {
        errors.push('GPA must be between 0 and 4.0');
    }
    
    if (data.year_level && !['1st', '2nd', '3rd', '4th', 'Graduate'].includes(data.year_level)) {
        errors.push('Year level must be 1st, 2nd, 3rd, 4th, or Graduate');
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, major } = req.query;
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        
        let students;
        let total = 0;
        
        if (major) {
            students = await Student.getByMajor(major, safePage, safeLimit);
            total = await Student.getCountByMajor(major);
        } else {
            students = await Student.getAll(safePage, safeLimit);
            total = await Student.getTotalCount();
        }
        
        res.json({
            success: true,
            data: students,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit)
            }
        });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { user_id, student_id, major, year_level, gpa } = req.body;
        
        if (!user_id || !student_id || !major || !year_level) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: user_id, student_id, major, year_level' 
            });
        }

        const validationErrors = validateStudentData({ gpa, year_level });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const existingStudent = await Student.findByStudentId(student_id);
        if (existingStudent) {
            return res.status(409).json({ 
                success: false,
                message: 'Student ID already exists' 
            });
        }

        const result = await Student.create({ 
            user_id, 
            student_id, 
            major, 
            year_level, 
            gpa: gpa || null 
        });
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Student created successfully' 
        });
    } catch (error) {
        console.error('Create student error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Student with this ID already exists'
            });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user_id'
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
        const student = await Student.getById(id);
        
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: student 
        });
    } catch (error) {
        console.error('Get student by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.findByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const student = await Student.findByUserId(userId);
        
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found for this user' 
            });
        }
        
        res.json({ 
            success: true,
            data: student 
        });
    } catch (error) {
        console.error('Get student by user ID error:', error);
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
        const { student_id, major, year_level, gpa } = req.body;
        
        const validationErrors = validateStudentData({ gpa, year_level });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Student.update(id, { student_id, major, year_level, gpa });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Student updated successfully' 
        });
    } catch (error) {
        console.error('Update student error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Student ID already exists'
            });
        }
        
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
        const result = await Student.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Student deleted successfully' 
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getByMajor = async (req, res) => {
    try {
        const { major } = req.params;
        const { page = 1, limit = 10 } = req.query;  
        
        if (!major) {
            return res.status(400).json({ 
                success: false, 
                message: 'Major parameter is required' 
            });
        }
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        
        const students = await Student.getByMajor(major, safePage, safeLimit);
        const total = await Student.getCountByMajor(major);
        
        res.json({ 
            success: true,
            data: students,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit)
            }
        });
    } catch (error) {
        console.error('Get students by major error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};