const jwtUtils = require('../utils/jwt');
exports.authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. No token provided.' 
            });
        }

        const token = jwtUtils.extractToken(authHeader);
        const decoded = jwtUtils.verifyAccessToken(token);
        req.user = decoded;
        
        console.log(`User authenticated: ${decoded.email} (ID: ${decoded.id}, Role: ${decoded.role})`);
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please log in again.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired. Please log in again.',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
            });
        }

        console.log(` User authorized: ${req.user.email} (Role: ${req.user.role})`);
        
        next();
    };
};


exports.optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const token = jwtUtils.extractToken(authHeader);
            const decoded = jwtUtils.verifyAccessToken(token);
            req.user = decoded;
        }
        
        next();
    } catch (error) {
        next();
    }
};


exports.checkOwnership = (req, res, next) => {
    const resourceUserId = parseInt(req.params.id || req.params.userId);
    const currentUserId = req.user.id;
    
    if (req.user.role === 'admin') {
        return next();
    }
    
    if (resourceUserId !== currentUserId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.'
        });
    }
    
    next();
};