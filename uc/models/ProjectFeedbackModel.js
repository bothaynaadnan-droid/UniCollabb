const db = require("../config/DB");

const ProjectFeedback = {
    getAll: async (page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        
        const limitInt = parseInt(safeLimit);
        const offsetInt = parseInt(offset);
        
        const sql = `
            SELECT 
                pf.*,
                p.title as project_title,
                s.employee_id,
                sup.name as supervisor_name,
                sup.email as supervisor_email
            FROM project_feedback pf
            JOIN projects p ON pf.project_id = p.id
            JOIN supervisors s ON pf.supervisor_id = s.id
            JOIN users sup ON s.user_id = sup.id
            ORDER BY pf.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await db.query(sql);
        return rows;
    },

    getAllByStatus: async (status, page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        
        const limitInt = parseInt(safeLimit);
        const offsetInt = parseInt(offset);
        
        const sql = `
            SELECT 
                pf.*,
                p.title as project_title,
                s.employee_id,
                sup.name as supervisor_name,
                sup.email as supervisor_email
            FROM project_feedback pf
            JOIN projects p ON pf.project_id = p.id
            JOIN supervisors s ON pf.supervisor_id = s.id
            JOIN users sup ON s.user_id = sup.id
            WHERE pf.status = ?
            ORDER BY pf.created_at DESC
            LIMIT ${limitInt} OFFSET ${offsetInt}
        `;
        
        const [rows] = await db.execute(sql, [status]);
        return rows;
    },

    getTotalCount: async () => {
        const sql = `SELECT COUNT(*) as count FROM project_feedback`;
        const [rows] = await db.query(sql);
        return rows[0].count;
    },

    getCountByStatus: async (status) => {
        const sql = `SELECT COUNT(*) as count FROM project_feedback WHERE status = ?`;
        const [rows] = await db.execute(sql, [status]);
        return rows[0].count;
    },

    create: async ({ project_id, supervisor_id, comments, rating, status }) => {
        const sql = `
            INSERT INTO project_feedback (project_id, supervisor_id, comments, rating, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            project_id, supervisor_id, comments, rating, status || 'draft'
        ]);
        return { id: result.insertId };
    },

    getById: async (id) => {
        const sql = `
            SELECT 
                pf.*,
                p.title as project_title,
                s.employee_id,
                sup.name as supervisor_name,
                sup.email as supervisor_email
            FROM project_feedback pf
            JOIN projects p ON pf.project_id = p.id
            JOIN supervisors s ON pf.supervisor_id = s.id
            JOIN users sup ON s.user_id = sup.id
            WHERE pf.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    getByProject: async (project_id) => {
        const sql = `
            SELECT 
                pf.*,
                s.employee_id,
                sup.name as supervisor_name,
                sup.email as supervisor_email
            FROM project_feedback pf
            JOIN supervisors s ON pf.supervisor_id = s.id
            JOIN users sup ON s.user_id = sup.id
            WHERE pf.project_id = ?
            ORDER BY pf.created_at DESC
        `;
        const [rows] = await db.execute(sql, [project_id]);
        return rows;
    },

    getBySupervisor: async (supervisor_id) => {
        const sql = `
            SELECT 
                pf.*,
                p.title as project_title,
                p.description as project_description,
                creator.name as creator_name
            FROM project_feedback pf
            JOIN projects p ON pf.project_id = p.id
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            WHERE pf.supervisor_id = ?
            ORDER BY pf.created_at DESC
        `;
        const [rows] = await db.execute(sql, [supervisor_id]);
        return rows;
    },

    findByProjectAndSupervisor: async (project_id, supervisor_id) => {
        const sql = `
            SELECT * FROM project_feedback 
            WHERE project_id = ? AND supervisor_id = ?
        `;
        const [rows] = await db.execute(sql, [project_id, supervisor_id]);
        return rows[0];
    },

    update: async (id, { comments, rating, status }) => {
        const sql = `
            UPDATE project_feedback
            SET comments = ?, rating = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [comments, rating, status, id]);
        return { affectedRows: result.affectedRows };
    },

    updateStatus: async (id, status) => {
        const sql = `UPDATE project_feedback SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(sql, [status, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM project_feedback WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    getAverageRating: async (project_id) => {
        const sql = `SELECT AVG(rating) as average_rating FROM project_feedback WHERE project_id = ? AND status = 'published'`;
        const [rows] = await db.execute(sql, [project_id]);
        return rows[0].average_rating;
    },

    getSupervisorStats: async (supervisor_id) => {
        const sql = `
            SELECT 
                COUNT(*) as total_feedback,
                AVG(rating) as average_rating,
                status,
                COUNT(*) as status_count
            FROM project_feedback 
            WHERE supervisor_id = ?
            GROUP BY status
        `;
        const [rows] = await db.execute(sql, [supervisor_id]);
        return rows;
    }
};

module.exports = ProjectFeedback;