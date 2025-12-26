const Message = require('../models/MessagesModel');

const validateMessageData = (data, isUpdate = false) => {
    const errors = [];
    
    if (!isUpdate && (!data.conversation_id || !data.sender_id || !data.message_text)) {
        errors.push('conversation_id, sender_id, and message_text are required');
    }
    
    if (data.message_text && data.message_text.length > 2000) {
        errors.push('Message must be less than 2000 characters');
    }
    
    if (data.message_text && data.message_text.trim().length === 0) {
        errors.push('Message cannot be empty');
    }
    
    const validTypes = ['text', 'file', 'image', 'system'];
    if (data.message_type && !validTypes.includes(data.message_type)) {
        errors.push(`Message type must be one of: ${validTypes.join(', ')}`);
    }
    
    return errors;
};

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 50, conversation_id } = req.query;
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        
        let messages;
        let total = 0;
        
        if (conversation_id) {
            messages = await Message.getByConversation(conversation_id, safePage, safeLimit);
            total = await Message.getCountByConversation(conversation_id);
        } else {
            messages = await Message.getAll(safePage, safeLimit);
            total = await Message.getTotalCount();
        }
        
        res.json({
            success: true,
            data: messages,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit)
            }
        });
    } catch (error) {
        console.error('Get all messages error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { conversation_id, sender_id, message_text, message_type } = req.body;
        
        if (!conversation_id || !sender_id || !message_text) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: conversation_id, sender_id, message_text' 
            });
        }

        const validationErrors = validateMessageData({ conversation_id, sender_id, message_text, message_type });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Message.create({ 
            conversation_id, 
            sender_id, 
            message_text: message_text.trim(),
            message_type 
        });
        
        res.status(201).json({ 
            success: true,
            data: result,
            message: 'Message sent successfully' 
        });
    } catch (error) {
        console.error('Send message error:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation_id or sender_id'
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
        const message = await Message.getById(id);
        
        if (!message) {
            return res.status(404).json({ 
                success: false,
                message: 'Message not found' 
            });
        }
        
        res.json({ 
            success: true,
            data: message 
        });
    } catch (error) {
        console.error('Get message by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getByConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        
        const messages = await Message.getByConversation(conversationId, safePage, safeLimit);
        const unreadCount = await Message.getUnreadCount(conversationId, req.user?.id || 0);
        
        res.json({ 
            success: true,
            data: messages,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total: messages.length
            },
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error('Get conversation messages error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getBySender = async (req, res) => {
    try {
        const { senderId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        
        const messages = await Message.getBySender(senderId, safePage, safeLimit);
        
        res.json({ 
            success: true,
            data: messages,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total: messages.length
            }
        });
    } catch (error) {
        console.error('Get sender messages error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.searchInConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { q: searchTerm } = req.query;
        
        if (!searchTerm || searchTerm.length < 2) {
            return res.status(400).json({ 
                success: false,
                message: 'Search term must be at least 2 characters long' 
            });
        }

        const messages = await Message.searchInConversation(conversationId, searchTerm);
        
        res.json({ 
            success: true,
            data: messages,
            count: messages.length,
            searchTerm: searchTerm
        });
    } catch (error) {
        console.error('Search messages error:', error);
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
        const { message_text, message_type } = req.body;
        
        if (!message_text) {
            return res.status(400).json({ 
                success: false,
                message: 'message_text is required' 
            });
        }

        const validationErrors = validateMessageData({ message_text, message_type }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Message.update(id, { message_text: message_text.trim(), message_type });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Message not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Message updated successfully' 
        });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Message.markAsRead(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Message not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Message marked as read' 
        });
    } catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.markConversationAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false,
                message: 'userId is required' 
            });
        }

        const result = await Message.markConversationAsRead(conversationId, userId);
        
        res.json({ 
            success: true,
            message: `${result.affectedRows} messages marked as read` 
        });
    } catch (error) {
        console.error('Mark conversation as read error:', error);
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
        const result = await Message.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Message not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Message deleted successfully' 
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};