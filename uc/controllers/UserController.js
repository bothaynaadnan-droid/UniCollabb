const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');



const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 8;
};

const validateUserData = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.name || data.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!data.email || !validateEmail(data.email)) {
            errors.push('Valid email is required');
        }

        if (!data.password || !validatePassword(data.password)) {
            errors.push('Password must be at least 8 characters long');
        }
    } else {
        if (data.name && data.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (data.email && !validateEmail(data.email)) {
            errors.push('Valid email is required');
        }
    }

    const validRoles = ['student', 'supervisor', 'admin'];
    if (data.role && !validRoles.includes(data.role)) {
        errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }

    return errors;
};


exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, role } = req.query;

        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        let users;
        let totalCount;

        if (role) {
            users = await User.findByRole(role, parsedPage, parsedLimit);
            totalCount = await User.getCountByRole(role);
        } else {
            users = await User.getAll(parsedPage, parsedLimit);
            totalCount = await User.getCount();
        }

        const safeUsers = users.map(user => {
            const { password, verification_token, ...safeUser } = user;
            return safeUser;
        });

        res.json({
            success: true,
            data: safeUsers,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total: totalCount,
                pages: Math.ceil(totalCount / parsedLimit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.create = async (req, res) => {
    try {
        const { name, email, password, role, university } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, email, password'
            });
        }

        const validationErrors = validateUserData({ name, email, password, role });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const existingUser = await User.findByEmail(email.toLowerCase().trim());
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'student',
            university: university || null
        });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await User.updateVerificationToken(result.id, verificationToken, tokenExpires);

        const emailResult = await emailService.sendVerificationEmail(
            email.toLowerCase().trim(),
            name.trim(),
            verificationToken
        );

        if (!emailResult.success) {
            console.warn(' Verification email failed to send:', emailResult.error);
        }

        res.status(201).json({
            success: true,
            data: {
                id: result.id,
                email: email.toLowerCase().trim(),
                name: name.trim()
            },
            message: 'User created successfully. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Create user error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, verification_token, verification_token_expires, ...safeUser } = user;

        res.json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.getByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findByEmail(email.toLowerCase().trim());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, verification_token, verification_token_expires, ...safeUser } = user;

        res.json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Get user by email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, university } = req.body;

        const validationErrors = validateUserData({ name, email, university }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        if (email) {
            const existingUser = await User.findByEmail(email.toLowerCase().trim());
            if (existingUser && existingUser.id !== parseInt(id)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use by another user'
                });
            }
        }

        const result = await User.update(id, {
            name: name?.trim(),
            email: email?.toLowerCase().trim(),
            university
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email already in use'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.updatePassword(id, hashedPassword);

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await User.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findByEmail(email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                needsVerification: true
            });
        }

        if (user.is_banned) {
            return res.status(403).json({
                success: false,
                message: `Your account has been banned. Reason: ${user.ban_reason || 'No reason provided'}`,
                isBanned: true
            });
        }

        let isMatch = false;

        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (compareErr) {
            // Backward-compat: some legacy rows may store plaintext passwords.
            // If bcrypt fails AND the stored password does not look like a bcrypt hash, allow a direct match
            // then migrate it to a bcrypt hash.
            const stored = user?.password;
            const looksBcrypt = typeof stored === 'string' && stored.startsWith('$2');

            if (!looksBcrypt && typeof stored === 'string') {
                isMatch = password === stored;

                if (isMatch) {
                    try {
                        const rounds = Math.max(10, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12);
                        const hashedPassword = await bcrypt.hash(password, rounds);
                        await User.updatePassword(user.id, hashedPassword);
                    } catch (migrateErr) {
                        // If migration fails, still allow login (do not block user)
                        console.warn('Password migration failed:', migrateErr?.message || migrateErr);
                    }
                }
            } else {
                throw compareErr;
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const jwtUtils = require('../utils/jwt');
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const tokens = jwtUtils.generateTokenPair(tokenPayload);

        const { password: _, verification_token, verification_token_expires,
            password_reset_token, password_reset_expires, ...safeUser } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: safeUser,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        // Common infra/config issues (return clearer status/message than generic 500)
        if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(503).json({
                success: false,
                message: 'Database authentication failed. Check DB_USER/DB_PASSWORD in uc/.env and ensure MySQL is running.',
                details: error.message
            });
        }
        if (error?.code === 'ER_BAD_DB_ERROR') {
            return res.status(503).json({
                success: false,
                message: 'Database not found. Check DB_NAME in uc/.env and ensure the schema exists.',
                details: error.message
            });
        }
        if (error?.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Database connection refused. Ensure MySQL is running and DB_HOST/DB_PORT are correct.',
                details: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const jwtUtils = require('../utils/jwt');
        const decoded = jwtUtils.verifyRefreshToken(refreshToken);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified'
            });
        }

        if (user.is_banned) {
            return res.status(403).json({
                success: false,
                message: 'Account is banned'
            });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const tokens = jwtUtils.generateTokenPair(tokenPayload);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);

        if (error.message.includes('Invalid')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        const user = await User.findByVerificationToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token. Please request a new verification email.'
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified. You can log in now.'
            });
        }

        await User.verifyEmail(user.id);

        await emailService.sendWelcomeEmail(user.email, user.name);

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
            data: {
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findByEmail(email.toLowerCase().trim());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified. You can log in now.'
            });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);


        await User.updateVerificationToken(user.id, verificationToken, tokenExpires);

        const emailResult = await emailService.sendVerificationEmail(
            user.email,
            user.name,
            verificationToken
        );

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.'
            });
        }

        res.json({
            success: true,
            message: 'Verification email sent successfully. Please check your inbox.'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findByEmail(email.toLowerCase().trim());

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        await User.updatePasswordResetToken(user.id, resetToken, tokenExpires);

        const emailResult = await emailService.sendPasswordResetEmail(
            user.email,
            user.name,
            resetToken
        );

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        const user = await User.findByPasswordResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.updatePassword(user.id, hashedPassword);
        await User.clearPasswordResetToken(user.id);

        res.json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, verification_token, verification_token_expires, password_reset_token, password_reset_expires, ...safeUser } = user;

        res.json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, university } = req.body;

        const validationErrors = validateUserData({ name, email, university }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        if (email) {
            const existingUser = await User.findByEmail(email.toLowerCase().trim());
            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use by another user'
                });
            }
        }

        const result = await User.update(userId, {
            name: name?.trim(),
            email: email?.toLowerCase().trim(),
            university
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await User.findById(userId);
        const { password, verification_token, verification_token_expires, password_reset_token, password_reset_expires, ...safeUser } = updatedUser;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: safeUser
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email already in use'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 12);


        await User.updatePassword(userId, hashedPassword);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        await User.delete(userId);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.getCount();
        const studentCount = await User.getCountByRole('student');
        const supervisorCount = await User.getCountByRole('supervisor');
        const adminCount = await User.getCountByRole('admin');
        const verifiedCount = await User.getVerifiedCount();
        const unverifiedCount = totalUsers - verifiedCount;

        res.json({
            success: true,
            data: {
                total: totalUsers,
                byRole: {
                    students: studentCount,
                    supervisors: supervisorCount,
                    admins: adminCount
                },
                byVerification: {
                    verified: verifiedCount,
                    unverified: unverifiedCount
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
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

        const validRoles = ['student', 'supervisor', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        if (req.user.id === parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const result = await User.updateRole(id, role);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User role updated to ${role} successfully`,
            data: {
                userId: id,
                newRole: role
            }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.manualVerify = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'User email is already verified'
            });
        }

        await User.verifyEmail(id);

        await emailService.sendWelcomeEmail(user.email, user.name);

        res.json({
            success: true,
            message: 'User email verified successfully',
            data: {
                userId: id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Manual verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;


        if (req.user.id === parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'You cannot ban yourself'
            });
        }


        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot ban admin users'
            });
        }


        const result = await User.banUser(id, reason || 'No reason provided');

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User banned successfully',
            data: {
                userId: id,
                email: user.email,
                reason: reason || 'No reason provided'
            }
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.unbanUser = async (req, res) => {
    try {
        const { id } = req.params;


        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        const result = await User.unbanUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User unbanned successfully',
            data: {
                userId: id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q: searchTerm, page = 1, limit = 10 } = req.query;

        if (!searchTerm || searchTerm.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search term must be at least 2 characters long'
            });
        }

        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        const users = await User.searchUsers(searchTerm, parsedPage, parsedLimit);
        const totalCount = await User.getSearchCount(searchTerm);


        const safeUsers = users.map(user => {
            const { password, verification_token, password_reset_token, ...safeUser } = user;
            return safeUser;
        });

        res.json({
            success: true,
            data: safeUsers,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total: totalCount,
                pages: Math.ceil(totalCount / parsedLimit)
            },
            searchTerm: searchTerm
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const user = await User.findByEmail(email.toLowerCase().trim());

        res.json({
            success: true,
            data: {
                exists: !!user,
                email: email.toLowerCase().trim()
            }
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.refreshToken = async (req, res) => {
    try {
        const userId = req.user.id;


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified'
            });
        }


        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: token
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};


exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;


        console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = exports;