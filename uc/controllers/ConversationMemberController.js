const ConversationMember = require('../models/ConversationMemberModel');

const validateMemberData = (data) => {
    const errors = [];
    
    if (!data.conversation_id || !data.user_id) {
        errors.push('conversation_id and user_id are required');
    }
    
    const validRoles = ['member', 'admin', 'moderator'];
    if (data.role && !validRoles.includes(data.role)) {
        errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        console.log('getAll function called');
        res.json({ success: true, data: [], message: 'test' });
    } catch (error) {
        console.error('Get all conversation members error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { conversation_id, user_id, role } = req.body;
        
        if (!conversation_id || !user_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: conversation_id, user_id' 
            });
        }

        const validationErrors = validateMemberData({ conversation_id, user_id, role });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const existingMember = await ConversationMember.findByConversationAndUser(conversation_id, user_id);
        if (existingMember) {
            return res.status(409).json({ 
                success: false,
                message: 'User is already a member of this conversation' 
            });
        }

        const result = await ConversationMember.create({ 
            conversation_id, 
            user_id, 
            role 
        });
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Member added to conversation successfully' 
        });
    } catch (error) {
        console.error('Add conversation member error:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation_id or user_id'
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
        const member = await ConversationMember.getById(id);
        
        if (!member) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation member not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: member 
        });
    } catch (error) {
        console.error('Get conversation member by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getByConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const members = await ConversationMember.getByConversation(conversationId);
        
        const memberCount = await ConversationMember.getMemberCount(conversationId);
        
        res.json({ 
            success: true,
            data: members,
            count: memberCount
        });
    } catch (error) {
        console.error('Get conversation members error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await ConversationMember.getByUser(userId);
        
        res.json({ 
            success: true,
            data: conversations,
            count: conversations.length
        });
    } catch (error) {
        console.error('Get user conversations error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
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

        const validationErrors = validateMemberData({ role });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await ConversationMember.updateRole(id, role);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation member not found' 
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
            message: 'Internal server error' 
        });
    }
};

exports.leaveConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ConversationMember.leaveConversation(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation member not found or already left' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Left conversation successfully' 
        });
    } catch (error) {
        console.error('Leave conversation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.leaveByConversationAndUser = async (req, res) => {
    try {
        const { conversationId, userId } = req.params;
        const result = await ConversationMember.leaveByConversationAndUser(conversationId, userId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation member not found or already left' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Left conversation successfully' 
        });
    } catch (error) {
        console.error('Leave conversation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ConversationMember.removeMember(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation member not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Member removed from conversation successfully' 
        });
    } catch (error) {
        console.error('Remove conversation member error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.removeByConversationAndUser = async (req, res) => {
    try {
        const { conversationId, userId } = req.params;
        const result = await ConversationMember.removeByConversationAndUser(conversationId, userId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation member not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Member removed from conversation successfully' 
        });
    } catch (error) {
        console.error('Remove conversation member error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.isMember = async (req, res) => {
    try {
        const { conversationId, userId } = req.params;
        const isMember = await ConversationMember.isMember(conversationId, userId);
        
        res.json({ 
            success: true,
            data: { isMember }
        });
    } catch (error) {
        console.error('Check member status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const admins = await ConversationMember.getAdmins(conversationId);
        
        res.json({ 
            success: true,
            data: admins,
            count: admins.length
        });
    } catch (error) {
        console.error('Get conversation admins error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};