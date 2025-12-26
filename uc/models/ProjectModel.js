const db = require("../config/DB");

const Project = {
    create: async ({ title, description, creator_id, supervisor_id, status, deadline, requirements, visibility }) => {
        const sql = `
            INSERT INTO projects (title, description, creator_id, supervisor_id, status, deadline, requirements, visibility)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            title, description, creator_id, supervisor_id, status || 'planning', 
            deadline, requirements, visibility || 'public'
        ]);
        return { id: result.insertId };
    },

    getAll: async (visibility = null) => {
        let sql = `
            SELECT 
                p.*,
                creator.name as creator_name,
                creator.email as creator_email,
                creator.university as creator_university,
                supervisor.name as supervisor_name,
                supervisor.university as supervisor_university
            FROM projects p
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            LEFT JOIN supervisors ss ON p.supervisor_id = ss.id
            LEFT JOIN users supervisor ON ss.user_id = supervisor.id
        `;
        
        if (visibility) {
            sql += ` WHERE p.visibility = ?`;
            const [rows] = await db.execute(sql, [visibility]);
            return rows;
        }
        
        const [rows] = await db.execute(sql);
        return rows;
    },

    getById: async (id) => {
        const sql = `
            SELECT 
                p.*,
                creator.name as creator_name,
                creator.email as creator_email,
                creator.university as creator_university,
                supervisor.name as supervisor_name,
                supervisor.university as supervisor_university
            FROM projects p
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            LEFT JOIN supervisors ss ON p.supervisor_id = ss.id
            LEFT JOIN users supervisor ON ss.user_id = supervisor.id
            WHERE p.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    findByCreator: async (creator_id) => {
        const sql = `
            SELECT 
                p.*,
                creator.name as creator_name,
                creator.email as creator_email,
                creator.university as creator_university,
                supervisor.name as supervisor_name,
                supervisor.university as supervisor_university
            FROM projects p
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            LEFT JOIN supervisors ss ON p.supervisor_id = ss.id
            LEFT JOIN users supervisor ON ss.user_id = supervisor.id
            WHERE p.creator_id = ?
            ORDER BY p.created_at DESC
        `;
        const [rows] = await db.execute(sql, [creator_id]);
        return rows;
    },

    findBySupervisor: async (supervisor_id) => {
        const sql = `
            SELECT 
                p.*,
                creator.name as creator_name,
                creator.email as creator_email,
                creator.university as creator_university,
                supervisor.name as supervisor_name,
                supervisor.university as supervisor_university
            FROM projects p
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            LEFT JOIN supervisors ss ON p.supervisor_id = ss.id
            LEFT JOIN users supervisor ON ss.user_id = supervisor.id
            WHERE p.supervisor_id = ?
            ORDER BY p.created_at DESC
        `;
        const [rows] = await db.execute(sql, [supervisor_id]);
        return rows;
    },

    update: async (id, { title, description, status, deadline, requirements, visibility }) => {
        const sql = `
            UPDATE projects
            SET title = ?, description = ?, status = ?, deadline = ?, requirements = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [
            title, description, status, deadline, requirements, visibility, id
        ]);
        return { affectedRows: result.affectedRows };
    },

    updateStatus: async (id, status) => {
        const sql = `UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [status, id]);
        return { affectedRows: result.affectedRows };
    },

    updateSupervisor: async (id, supervisor_id) => {
        const sql = `UPDATE projects SET supervisor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [supervisor_id, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM projects WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    findByStatus: async (status, page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT 
                p.*,
                creator.name as creator_name,
                creator.email as creator_email,
                creator.university as creator_university,
                supervisor.name as supervisor_name,
                supervisor.university as supervisor_university
            FROM projects p
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            LEFT JOIN supervisors ss ON p.supervisor_id = ss.id
            LEFT JOIN users supervisor ON ss.user_id = supervisor.id
            WHERE p.status = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [status, limit, offset]);
        return rows;
    }
};

module.exports = Project;
