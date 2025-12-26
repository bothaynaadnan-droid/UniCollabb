const db = require("../config/DB");

const Conversation = {
    create: async ({ name, type, created_by }) => {
        const sql = `
            INSERT INTO conversations (name, type, created_by)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(sql, [name, type || 'direct', created_by]);
        return { id: result.insertId };
    },

    getAll: async () => {
        const sql = `
            SELECT 
                c.*,
                creator.name as creator_name,
                creator.email as creator_email,
                (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id AND left_at IS NULL) as participant_count,
                (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
                (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_time
            FROM conversations c
            JOIN users creator ON c.created_by = creator.id
            ORDER BY c.updated_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
},
    getById: async (id) => {
        const sql = `
            SELECT 
                c.*,
                creator.name as creator_name,
                creator.email as creator_email,
                (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as participant_count
            FROM conversations c
            JOIN users creator ON c.created_by = creator.id
            WHERE c.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    getByCreator: async (created_by) => {
        const sql = `
            SELECT 
                c.*,
                creator.name as creator_name,
                (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as participant_count,
                (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message
            FROM conversations c
            JOIN users creator ON c.created_by = creator.id
            WHERE c.created_by = ?
            ORDER BY c.updated_at DESC
        `;
        const [rows] = await db.execute(sql, [created_by]);
        return rows;
    },

    getByParticipant: async (user_id) => {
        const sql = `
            SELECT 
                c.*,
                creator.name as creator_name,
                (SELECT COUNT(*) FROM conversation_members cm2 WHERE cm2.conversation_id = c.id) as participant_count,
                (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
                (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_time
            FROM conversations c
            JOIN conversation_members cm ON c.id = cm.conversation_id
            JOIN users creator ON c.created_by = creator.id
            WHERE cm.user_id = ?
            ORDER BY c.updated_at DESC
        `;
        const [rows] = await db.execute(sql, [user_id]);
        return rows;
    },

    getDirectConversation: async (user1_id, user2_id) => {
        const sql = `
            SELECT c.* 
            FROM conversations c
            JOIN conversation_members cm1 ON c.id = cm1.conversation_id
            JOIN conversation_members cm2 ON c.id = cm2.conversation_id
            WHERE c.type = 'direct' 
            AND cm1.user_id = ? 
            AND cm2.user_id = ?
            AND (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) = 2
        `;
        const [rows] = await db.execute(sql, [user1_id, user2_id]);
        return rows[0];
    },

    update: async (id, { name, type, description }) => {
        const sql = `
            UPDATE conversations
            SET name = ?, type = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [name, type, description, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM conversations WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    addParticipant: async (conversation_id, user_id, role = 'member') => {
        const sql = `
            INSERT INTO conversation_members (conversation_id, user_id, role)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(sql, [conversation_id, user_id, role]);
        return { id: result.insertId };
    },

    removeParticipant: async (conversation_id, user_id) => {
        const sql = `
            DELETE FROM conversation_members 
            WHERE conversation_id = ? AND user_id = ?
        `;
        const [result] = await db.execute(sql, [conversation_id, user_id]);
        return { affectedRows: result.affectedRows };
    },

    getParticipants: async (conversation_id) => {
        const sql = `
            SELECT 
                cm.*,
                u.name,
                u.email,
                u.university,
                s.student_id,
                sup.employee_id
            FROM conversation_members cm
            JOIN users u ON cm.user_id = u.id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN supervisors sup ON u.id = sup.user_id
            WHERE cm.conversation_id = ? AND cm.left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id]);
        return rows;
    },

    isParticipant: async (conversation_id, user_id) => {
        const sql = `
            SELECT 1 FROM conversation_members 
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id, user_id]);
        return rows.length > 0;
},

    updateLastActivity: async (id) => {
        const sql = `UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    }
};

module.exports = Conversation;