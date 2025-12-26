const db = require("../config/DB");

const Supervisor = {
    create: async ({ user_id, employee_id, department, specialization }) => {
        const sql = `
            INSERT INTO supervisors (user_id, employee_id, department, specialization)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [user_id, employee_id, department, specialization]);
        return { id: result.insertId };
    },

    getAll: async () => {
        const sql = `
            SELECT 
                sup.id, sup.employee_id, sup.department, sup.specialization,
                u.id as user_id, u.name, u.email, u.university
            FROM supervisors sup
            JOIN users u ON sup.user_id = u.id
            ORDER BY sup.created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    getById: async (id) => {
        const sql = `
            SELECT 
                sup.id, sup.employee_id, sup.department, sup.specialization,
                u.id as user_id, u.name, u.email, u.university
            FROM supervisors sup
            JOIN users u ON sup.user_id = u.id
            WHERE sup.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    findByUserId: async (user_id) => {
        const sql = `
            SELECT 
                sup.id, sup.employee_id, sup.department, sup.specialization,
                u.id as user_id, u.name, u.email, u.university
            FROM supervisors sup
            JOIN users u ON sup.user_id = u.id
            WHERE sup.user_id = ?
        `;
        const [rows] = await db.execute(sql, [user_id]);
        return rows[0];
    },

    findByEmployeeId: async (employee_id) => {
        const sql = `
            SELECT 
                sup.id, sup.employee_id, sup.department, sup.specialization,
                u.id as user_id, u.name, u.email, u.university
            FROM supervisors sup
            JOIN users u ON sup.user_id = u.id
            WHERE sup.employee_id = ?
        `;
        const [rows] = await db.execute(sql, [employee_id]);
        return rows[0];
    },

    update: async (id, { employee_id, department, specialization }) => {
        const sql = `
            UPDATE supervisors
            SET employee_id = ?, department = ?, specialization = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [employee_id, department, specialization, id]);
        return { affectedRows: result.affectedRows };
    },

    delete: async (id) => {
        const sql = `DELETE FROM supervisors WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return { affectedRows: result.affectedRows };
    },

    getByDepartment: async (department, page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT 
                sup.id, sup.employee_id, sup.department, sup.specialization,
                u.id as user_id, u.name, u.email, u.university
            FROM supervisors sup
            JOIN users u ON sup.user_id = u.id
            WHERE sup.department = ?
            ORDER BY u.name
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [department, limit, offset]);
        return rows;
    }
};

module.exports = Supervisor;