class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    
    console.error('═══════════════════════════════════════');
    console.error(' ERROR:', err.message);
    console.error('Path:', req.originalUrl);
    console.error('Method:', req.method);
    console.error('Time:', new Date().toISOString());
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }
    console.error('═══════════════════════════════════════');
    
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry. This record already exists.'
        });
    }
    
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference. The related record does not exist.'
        });
    }
    
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again later.'
        });
    }
    
    if (err.code === 'ER_DATA_TOO_LONG') {
        return res.status(400).json({
            success: false,
            message: 'Data too long for field.'
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please log in again.'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired. Please log in again.'
        });
    }
    
    res.status(err.statusCode).json({
        success: false,
        message: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack 
        })
    });
};

module.exports = { AppError, globalErrorHandler };