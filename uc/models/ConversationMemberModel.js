const db = require("../config/DB");

const ConversationMember = {
    getAll: async (page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        
        const sql = `
            SELECT 
                cm.*,
                u.name as user_name,
                u.email as user_email,
                u.university,
                c.name as conversation_name
            FROM conversation_members cm
            JOIN users u ON cm.user_id = u.id
            JOIN conversations c ON cm.conversation_id = c.id
            WHERE cm.left_at IS NULL
            ORDER BY cm.joined_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [safeLimit, offset]);
        return rows;
    },

    getTotalCount: async () => {
        const sql = `SELECT COUNT(*) as count FROM conversation_members WHERE left_at IS NULL`;
        const [rows] = await db.execute(sql);
        return rows[0].count;
    },

    create: async ({ conversation_id, user_id, role = 'member' }) => {
        const sql = `
            INSERT INTO conversation_members (conversation_id, user_id, role)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(sql, [conversation_id, user_id, role]);
        return { id: result.insertId };
    },

    getById: async (id) => {
        const sql = `
            SELECT 
                cm.*,
                u.name as user_name,
                u.email as user_email,
                u.university,
                c.name as conversation_name
            FROM conversation_members cm
            JOIN users u ON cm.user_id = u.id
            JOIN conversations c ON cm.conversation_id = c.id
            WHERE cm.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    getByConversation: async (conversation_id) => {
        const sql = `
            SELECT 
                cm.*,
                u.name as user_name,
                u.email as user_email,
                u.university,
                s.student_id,
                sup.employee_id,
                sup.department as supervisor_department
            FROM conversation_members cm
            JOIN users u ON cm.user_id = u.id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN supervisors sup ON u.id = sup.user_id
            WHERE cm.conversation_id = ? AND cm.left_at IS NULL
            ORDER BY cm.joined_at ASC
        `;
        const [rows] = await db.execute(sql, [conversation_id]);
        return rows;
    },

    getByUser: async (user_id) => {
        const sql = `
            SELECT 
                cm.*,
                c.name as conversation_name,
                c.type as conversation_type,
                c.created_by,
                creator.name as creator_name,
                (SELECT COUNT(*) FROM conversation_members cm2 WHERE cm2.conversation_id = c.id AND cm2.left_at IS NULL) as member_count,
                (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message
            FROM conversation_members cm
            JOIN conversations c ON cm.conversation_id = c.id
            JOIN users creator ON c.created_by = creator.id
            WHERE cm.user_id = ? AND cm.left_at IS NULL
            ORDER BY c.updated_at DESC
        `;
        const [rows] = await db.execute(sql, [user_id]);
        return rows;
    },

    findByConversationAndUser: async (conversation_id, user_id) => {
        const sql = `
            SELECT * FROM conversation_members 
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id, user_id]);
        return rows[0];
    },

    updateRole: async (id, role) => {
        const sql = `
            UPDATE conversation_members
            SET role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND left_at IS NULL
        `;
        const [result] = await db.execute(sql, [role, id]);
        return { affectedRows: result.affectedRows };
    },

    leaveConversation: async (id) => {
        const sql = `
            UPDATE conversation_members
            SET left_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND left_at IS NULL
        `;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    leaveByConversationAndUser: async (conversation_id, user_id) => {
        const sql = `
            UPDATE conversation_members
            SET left_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `;
        const [result] = await db.execute(sql, [conversation_id, user_id]);
        return { affectedRows: result.affectedRows };
    },

    removeMember: async (id) => {
        const sql = `DELETE FROM conversation_members WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    removeByConversationAndUser: async (conversation_id, user_id) => {
        const sql = `DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?`;
        const [result] = await db.execute(sql, [conversation_id, user_id]);
        return { affectedRows: result.affectedRows };
    },

    isMember: async (conversation_id, user_id) => {
        const sql = `
            SELECT 1 FROM conversation_members 
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id, user_id]);
        return rows.length > 0;
    },

    isAdmin: async (conversation_id, user_id) => {
        const sql = `
            SELECT 1 FROM conversation_members 
            WHERE conversation_id = ? AND user_id = ? AND role = 'admin' AND left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id, user_id]);
        return rows.length > 0;
    },

    getMemberCount: async (conversation_id) => {
        const sql = `
            SELECT COUNT(*) as member_count 
            FROM conversation_members 
            WHERE conversation_id = ? AND left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id]);
        return rows[0].member_count;
    },

    getAdmins: async (conversation_id) => {
        const sql = `
            SELECT 
                cm.*,
                u.name as user_name,
                u.email as user_email
            FROM conversation_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.conversation_id = ? AND cm.role = 'admin' AND cm.left_at IS NULL
        `;
        const [rows] = await db.execute(sql, [conversation_id]);
        return rows;
    }
};

module.exports = ConversationMember;