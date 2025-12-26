const Conversation = require('../models/ConversationModel');


const validateConversationData = (data, isUpdate = false) => {
    const errors = [];
    
    if (!isUpdate && (!data.name || !data.created_by)) {
        errors.push('name and created_by are required');
    }
    
    if (data.name && data.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (data.name && data.name.length > 100) {
        errors.push('Name must be less than 100 characters');
    }
    
    const validTypes = ['direct', 'group', 'project', 'announcement'];
    if (data.type && !validTypes.includes(data.type)) {
        errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }
    
    return errors;
};

exports.create = async (req, res) => {
    try {
        const { name, type, created_by, participants } = req.body;
        if (!name || !created_by) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: name, created_by' 
            });
        }

        const validationErrors = validateConversationData({ name, type, created_by });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        if (type === 'direct' && participants && participants.length === 1) {
            const existingConversation = await Conversation.getDirectConversation(created_by, participants[0]);
            if (existingConversation) {
                return res.status(200).json({ 
                    success: true,
                    data: existingConversation,
                    message: 'Existing direct conversation found' 
                });
            }
        }

        const result = await Conversation.create({ 
            name, 
            type: type || 'group', 
            created_by 
        });
        await Conversation.addParticipant(result.id, created_by, 'admin');
        if (participants && participants.length > 0) {
            for (const participant_id of participants) {
                if (participant_id !== created_by) {
                    await Conversation.addParticipant(result.id, participant_id);
                }
            }
        }
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Conversation created successfully' 
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
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
        const conversation = await Conversation.getById(id);
        if (!conversation) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation not found' 
            });
        }
        const participants = await Conversation.getParticipants(id);
        
        res.json({ 
            success: true,
            data: {
                ...conversation,
                participants: participants
            }
        });
    } catch (error) {
        console.error('Get conversation by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getByCreator = async (req, res) => {
    try {
        const { createdBy } = req.params;
        const conversations = await Conversation.getByCreator(createdBy);
        
        res.json({ 
            success: true,
            data: conversations,
            count: conversations.length
        });
    } catch (error) {
        console.error('Get conversations by creator error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getByParticipant = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.getByParticipant(userId);
        
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

exports.getOrCreateDirect = async (req, res) => {
    try {
        const { user1_id, user2_id } = req.params;
        
        let conversation = await Conversation.getDirectConversation(user1_id, user2_id);
        
        if (!conversation) {
            const result = await Conversation.create({
                name: 'Direct Message',
                type: 'direct',
                created_by: user1_id
            });
            
            await Conversation.addParticipant(result.id, user1_id);
            await Conversation.addParticipant(result.id, user2_id);
            
            conversation = await Conversation.getById(result.id);
        }
        
        res.json({ 
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error('Get or create direct conversation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description } = req.body;
        
        const validationErrors = validateConversationData({ name, type }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await Conversation.update(id, { name, type, description });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Conversation updated successfully' 
        });
    } catch (error) {
        console.error('Update conversation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.addParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, role } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ 
                success: false,
                message: 'user_id is required' 
            });
        }

        const result = await Conversation.addParticipant(id, user_id, role);
        
        res.status(201).json({ 
            success: true,
            data: { id: result.id },
            message: 'Participant added successfully' 
        });
    } catch (error) {
        console.error('Add participant error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'User is already a participant in this conversation'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.removeParticipant = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const result = await Conversation.removeParticipant(id, userId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Participant not found in conversation' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Participant removed successfully' 
        });
    } catch (error) {
        console.error('Remove participant error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.getParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const participants = await Conversation.getParticipants(id);
        
        res.json({ 
            success: true,
            data: participants,
            count: participants.length
        });
    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Conversation.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Conversation not found' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Conversation deleted successfully' 
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};
exports.getAll = async (req, res) => {
    try {
        const conversations = await Conversation.getAll();
        res.json({ 
            success: true,
            data: conversations,
            count: conversations.length
        });
    } catch (error) {
        console.error('Get all conversations error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};