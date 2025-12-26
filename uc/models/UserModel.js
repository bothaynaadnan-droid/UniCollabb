const db = require("../config/DB");

const User = {
    create: async ({ name, email, password, role, university }) => {
        const sql = `
            INSERT INTO users (name, email, password, role, university)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [name, email, password, role || 'student', university]);
        return { id: result.insertId };
    },

    getAll: async (page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        const sql = `
        SELECT id, name, email, role, university, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT ${parseInt(safeLimit)} OFFSET ${parseInt(offset)}
    `;

        const [rows] = await db.query(sql);
        return rows;
    },

    findByEmail: async (email) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    },

    findById: async (id) => {
        const sql = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    update: async (id, { name, email, university }) => {
        const sql = `UPDATE users SET name = ?, email = ?, university = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [name, email, university, id]);
        return { affectedRows: result.affectedRows };
    },

    updatePassword: async (id, hashedPassword) => {
        const sql = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [hashedPassword, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM users WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    getCount: async () => {
        const sql = `SELECT COUNT(*) as count FROM users`;
        const [rows] = await db.query(sql);
        return rows[0].count;
    },

    findByRole: async (role, page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;

        console.log('Model: findByRole params after parsing:', { role, safePage, safeLimit, offset });

        const sql = `
            SELECT id, name, email, role, university, created_at 
            FROM users 
            WHERE role = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.execute(sql, [role, safeLimit, offset]);
        return rows;
    },

    getCountByRole: async (role) => {
        const sql = `SELECT COUNT(*) as count FROM users WHERE role = ?`;
        const [rows] = await db.execute(sql, [role]);
        return rows[0].count;
    },


    updateVerificationToken: async (id, token, expires) => {
        const sql = `
        UPDATE users 
        SET verification_token = ?, verification_token_expires = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
        const [result] = await db.execute(sql, [token, expires, id]);
        return { affectedRows: result.affectedRows };
    },

    findByVerificationToken: async (token) => {
        const sql = `
        SELECT * FROM users 
        WHERE verification_token = ? 
        AND verification_token_expires > NOW()
    `;
        const [rows] = await db.execute(sql, [token]);
        return rows[0];
    },

    verifyEmail: async (id) => {
        const sql = `
        UPDATE users 
        SET is_verified = TRUE, 
            verification_token = NULL, 
            verification_token_expires = NULL,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },


updatePasswordResetToken: async (id, token, expires) => {
    const sql = `
        UPDATE users 
        SET password_reset_token = ?, password_reset_expires = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
    const [result] = await db.execute(sql, [token, expires, id]);
    return { affectedRows: result.affectedRows };
},

findByPasswordResetToken: async (token) => {
    const sql = `
        SELECT * FROM users 
        WHERE password_reset_token = ? 
        AND password_reset_expires > NOW()
    `;
    const [rows] = await db.execute(sql, [token]);
    return rows[0];
},

clearPasswordResetToken: async (id) => {
    const sql = `
        UPDATE users 
        SET password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
    const [result] = await db.execute(sql, [id]);
    return { affectedRows: result.affectedRows };
},

updateRole: async (id, role) => {
    const sql = `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await db.execute(sql, [role, id]);
    return { affectedRows: result.affectedRows };
},

getVerifiedCount: async () => {
    const sql = `SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE`;
    const [rows] = await db.query(sql);
    return rows[0].count;
},

banUser: async (id, reason) => {
    const sql = `
        UPDATE users 
        SET is_banned = TRUE, ban_reason = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
    const [result] = await db.execute(sql, [reason, id]);
    return { affectedRows: result.affectedRows };
},

unbanUser: async (id) => {
    const sql = `
        UPDATE users 
        SET is_banned = FALSE, ban_reason = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
    const [result] = await db.execute(sql, [id]);
    return { affectedRows: result.affectedRows };
},

searchUsers: async (searchTerm, page = 1, limit = 10) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (safePage - 1) * safeLimit;
    
    const sql = `
        SELECT id, name, email, role, university, is_verified, created_at 
        FROM users 
        WHERE name LIKE ? OR email LIKE ? OR university LIKE ?
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(sql, [searchPattern, searchPattern, searchPattern, safeLimit, offset]);
    return rows;
},

getSearchCount: async (searchTerm) => {
    const sql = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE name LIKE ? OR email LIKE ? OR university LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(sql, [searchPattern, searchPattern, searchPattern]);
    return rows[0].count;
}
};

module.exports = User;
