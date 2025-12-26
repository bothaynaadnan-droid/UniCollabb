const db = require("../config/DB");

const Student = {
    create: async ({ user_id, student_id, major, year_level, gpa }) => {
        const sql = `
            INSERT INTO students (user_id, student_id, major, year_level, gpa)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [user_id, student_id, major, year_level, gpa]);
        return { id: result.insertId };
    },

    getAll: async (page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        const limitInt = parseInt(safeLimit);
        const offsetInt = parseInt(offset);
        
        const sql = `
            SELECT
                s.id, s.student_id, s.major, s.year_level, s.gpa,
                u.id as user_id, u.name, u.email, u.university
            FROM students s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT ${limitInt} OFFSET ${offsetInt}
        `;
        
        const [rows] = await db.query(sql);
        return rows;
    },

    getById: async (id) => {
        const sql = `
            SELECT
                s.id, s.student_id, s.major, s.year_level, s.gpa,
                u.id as user_id, u.name, u.email, u.university
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    findByUserId: async (user_id) => {
        const sql = `
            SELECT
                s.id, s.student_id, s.major, s.year_level, s.gpa,
                u.id as user_id, u.name, u.email, u.university
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ?
        `;
        const [rows] = await db.execute(sql, [user_id]);
        return rows[0];
    },

    findByStudentId: async (student_id) => {
        const sql = `
            SELECT
                s.id, s.student_id, s.major, s.year_level, s.gpa,
                u.id as user_id, u.name, u.email, u.university
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.student_id = ?
        `;
        const [rows] = await db.execute(sql, [student_id]);
        return rows[0];
    },

    getByMajor: async (major, page = 1, limit = 10) => {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        
        const limitInt = parseInt(safeLimit);
        const offsetInt = parseInt(offset);
        
        const sql = `
            SELECT
                s.id, s.student_id, s.major, s.year_level, s.gpa,
                u.id as user_id, u.name, u.email, u.university
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.major = ?
            ORDER BY s.gpa DESC
            LIMIT ${limitInt} OFFSET ${offsetInt}
        `;
        
        const [rows] = await db.execute(sql, [major]);
        return rows;
    },

    getCountByMajor: async (major) => {
        const sql = `SELECT COUNT(*) as count FROM students WHERE major = ?`;
        const [rows] = await db.execute(sql, [major]);
        return rows[0].count;
    },

    getTotalCount: async () => {
        const sql = `SELECT COUNT(*) as count FROM students`;
        const [rows] = await db.query(sql);
        return rows[0].count;
    },

    update: async (id, { student_id, major, year_level, gpa }) => {
        const sql = `
            UPDATE students
            SET student_id = ?, major = ?, year_level = ?, gpa = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [student_id, major, year_level, gpa, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM students WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },
};

module.exports = Student;