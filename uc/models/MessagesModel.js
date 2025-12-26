const db = require("../config/DB");

const Message = {
    getAll: async (page = 1, limit = 50) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const offset = (safePage - 1) * safeLimit;
        
        const limitInt = parseInt(safeLimit);
        const offsetInt = parseInt(offset);
        
        const sql = `
            SELECT 
                m.*,
                u.name AS sender_name,
                u.email AS sender_email,
                c.name AS conversation_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN conversations c ON m.conversation_id = c.id
            ORDER BY m.sent_at DESC
            LIMIT ${limitInt} OFFSET ${offsetInt}
        `;
        
        const [rows] = await db.query(sql);
        return rows;
    },
    create: async ({ conversation_id, sender_id, message_text, message_type = 'text' }) => {
        const sql = `
            INSERT INTO messages (conversation_id, sender_id, message_text, message_type)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [conversation_id, sender_id, message_text, message_type]);
        return { 
            id: result.insertId,
            conversation_id,
            sender_id,
            message_text,
            message_type
        };
    },

    getById: async (id) => {
        const sql = `
            SELECT 
                m.*,
                u.name AS sender_name,
                u.email AS sender_email,
                u.university AS sender_university
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    getByConversation: async (conversation_id, page = 1, limit = 50) => {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT 
                m.*,
                u.name AS sender_name,
                u.email AS sender_email,
                u.university AS sender_university
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.sent_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [conversation_id, limit, offset]);
        return rows.reverse();
    },

    getBySender: async (sender_id, page = 1, limit = 20) => {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT 
                m.*,
                u.name AS sender_name,
                c.title AS conversation_title
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN conversations c ON m.conversation_id = c.id
            WHERE m.sender_id = ?
            ORDER BY m.sent_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [sender_id, limit, offset]);
        return rows;
    },

    update: async (id, { message_text, message_type }) => {
        const sql = `
            UPDATE messages
            SET message_text = ?, message_type = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [message_text, message_type, id]);
        return { affectedRows: result.affectedRows };
    },

    markAsRead: async (id) => {
        const sql = `UPDATE messages SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    markConversationAsRead: async (conversation_id, user_id) => {
        const sql = `
            UPDATE messages 
            SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
            WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE
        `;
        const [result] = await db.execute(sql, [conversation_id, user_id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM messages WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    searchInConversation: async (conversation_id, searchTerm) => {
        const sql = `
            SELECT 
                m.*,
                u.name AS sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ? 
            AND m.message_text LIKE ?
            ORDER BY m.sent_at DESC
        `;
        const [rows] = await db.execute(sql, [conversation_id, `%${searchTerm}%`]);
        return rows;
    },

    getUnreadCount: async (conversation_id, user_id) => {
        const sql = `
            SELECT COUNT(*) as unread_count
            FROM messages 
            WHERE conversation_id = ? 
            AND sender_id != ? 
            AND is_read = FALSE
        `;
        const [rows] = await db.execute(sql, [conversation_id, user_id]);
        return rows[0].unread_count;
    },

    getLastMessage: async (conversation_id) => {
        const sql = `
            SELECT 
                m.*,
                u.name AS sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.sent_at DESC
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [conversation_id]);
        return rows[0];
    },
    getTotalCount: async () => {
        const sql = `SELECT COUNT(*) as count FROM messages`;
        const [rows] = await db.query(sql);
        return rows[0].count;
    },
    getCountByConversation: async (conversation_id) => {
        const sql = `SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?`;
        const [rows] = await db.execute(sql, [conversation_id]);
        return rows[0].count;
    },

};

module.exports = Message;