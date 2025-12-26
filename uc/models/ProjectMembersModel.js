const db = require("../config/DB");

const ProjectMember = {
    getAll: async (page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        
        const limitInt = parseInt(safeLimit);
        const offsetInt = parseInt(offset);
        
        const sql = `
            SELECT 
                pm.id as member_id,
                pm.role,
                pm.joined_at,
                p.id as project_id,
                p.title as project_title,
                s.id as student_id,
                s.student_id as student_number,
                u.name as student_name,
                u.email as student_email
            FROM project_members pm
            JOIN projects p ON pm.project_id = p.id
            JOIN students s ON pm.student_id = s.id
            JOIN users u ON s.user_id = u.id
            ORDER BY pm.joined_at DESC
            LIMIT ${limitInt} OFFSET ${offsetInt}
        `;
        
        const [rows] = await db.query(sql);
        return rows;
    },

    getTotalCount: async () => {
        const sql = `SELECT COUNT(*) as count FROM project_members`;
        const [rows] = await db.query(sql);
        return rows[0].count;
    },

    create: async ({ project_id, student_id, role }) => {
        const sql = `
            INSERT INTO project_members (project_id, student_id, role)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(sql, [project_id, student_id, role || 'member']);
        return { id: result.insertId };
    },

    getById: async (id) => {
        const sql = `
            SELECT 
                pm.*,
                s.student_id,
                u.name as student_name,
                u.email as student_email,
                p.title as project_title
            FROM project_members pm
            JOIN students s ON pm.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN projects p ON pm.project_id = p.id
            WHERE pm.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    getMembersByProject: async (project_id) => {
        const sql = `
            SELECT 
                pm.id as member_id,
                pm.role,
                pm.joined_at,
                s.id as student_id,
                s.student_id as student_number,
                s.major,
                s.year_level,
                u.name as student_name,
                u.email as student_email
            FROM project_members pm
            JOIN students s ON pm.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE pm.project_id = ?
            ORDER BY pm.joined_at DESC
        `;
        const [rows] = await db.execute(sql, [project_id]);
        return rows;
    },

    getProjectsByStudent: async (student_id) => {
        const sql = `
            SELECT 
                pm.id as member_id,
                pm.role,
                pm.joined_at,
                p.*,
                creator.name as creator_name,
                supervisor.name as supervisor_name
            FROM project_members pm
            JOIN projects p ON pm.project_id = p.id
            LEFT JOIN students cs ON p.creator_id = cs.id
            LEFT JOIN users creator ON cs.user_id = creator.id
            LEFT JOIN supervisors ss ON p.supervisor_id = ss.id
            LEFT JOIN users supervisor ON ss.user_id = supervisor.id
            WHERE pm.student_id = ?
            ORDER BY p.created_at DESC
        `;
        const [rows] = await db.execute(sql, [student_id]);
        return rows;
    },

    findByProjectAndStudent: async (project_id, student_id) => {
        const sql = `
            SELECT * FROM project_members 
            WHERE project_id = ? AND student_id = ?
        `;
        const [rows] = await db.execute(sql, [project_id, student_id]);
        return rows[0];
    },

    update: async (id, { role }) => {
        const sql = `
            UPDATE project_members 
            SET role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [role, id]);
        return { affectedRows: result.affectedRows };
    },

    updateRole: async (id, role) => {
        const sql = `
            UPDATE project_members
            SET role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [role, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM project_members WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    deleteByProjectAndStudent: async (project_id, student_id) => {
        const sql = `DELETE FROM project_members WHERE project_id = ? AND student_id = ?`;
        const [result] = await db.execute(sql, [project_id, student_id]);
        return { affectedRows: result.affectedRows };
    },

    isMember: async (project_id, student_id) => {
        const sql = `
            SELECT 1 FROM project_members 
            WHERE project_id = ? AND student_id = ?
        `;
        const [rows] = await db.execute(sql, [project_id, student_id]);
        return rows.length > 0;
    },

    getMemberCountByProject: async (project_id) => {
        const sql = `
            SELECT COUNT(*) as count 
            FROM project_members 
            WHERE project_id = ?
        `;
        const [rows] = await db.execute(sql, [project_id]);
        return rows[0].count;
    }
};

module.exports = ProjectMember;