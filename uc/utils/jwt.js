const jwt = require('jsonwebtoken');

exports.generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: 'UniCollab',
            audience: 'UniCollab-Users'
        }
    );
};


exports.generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        { 
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            issuer: 'UniCollab',
            audience: 'UniCollab-Users'
        }
    );
};


exports.verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'UniCollab',
            audience: 'UniCollab-Users'
        });
    } catch (error) {
        throw new Error(`Invalid token: ${error.message}`);
    }
};


exports.verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
            issuer: 'UniCollab',
            audience: 'UniCollab-Users'
        });
    } catch (error) {
        throw new Error(`Invalid refresh token: ${error.message}`);
    }
};


exports.decodeToken = (token) => {
    return jwt.decode(token);
};


exports.generateTokenPair = (payload) => {
    const accessToken = exports.generateAccessToken(payload);
    const refreshToken = exports.generateRefreshToken(payload);
    
    return {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
};


exports.extractToken = (authHeader) => {
    if (!authHeader) {
        throw new Error('No authorization header provided');
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new Error('Invalid authorization header format. Use: Bearer <token>');
    }
    
    return parts[1];
};