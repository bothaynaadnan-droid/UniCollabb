const db = require('../config/DB');

const SupervisorRequest = {
  create: async ({ project_id, supervisor_id, message }) => {
    const sql = `
      INSERT INTO supervisor_requests (project_id, supervisor_id, message, status)
      VALUES (?, ?, ?, 'pending')
    `;
    const [result] = await db.execute(sql, [project_id, supervisor_id, message || null]);
    return { id: result.insertId };
  },

  findPendingByProjectAndSupervisor: async (project_id, supervisor_id) => {
    const sql = `
      SELECT * FROM supervisor_requests
      WHERE project_id = ? AND supervisor_id = ? AND status = 'pending'
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [project_id, supervisor_id]);
    return rows[0];
  },

  getById: async (id) => {
    const sql = `SELECT * FROM supervisor_requests WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  listForSupervisor: async (supervisor_id) => {
    const sql = `
      SELECT
        sr.id,
        sr.project_id,
        p.title AS project_title,
        p.description AS project_description,
        p.creator_id,
        u.name AS student_name,
        u.email AS student_email,
        sr.message,
        sr.status,
        sr.created_at
      FROM supervisor_requests sr
      JOIN projects p ON sr.project_id = p.id
      JOIN students cs ON p.creator_id = cs.id
      JOIN users u ON cs.user_id = u.id
      WHERE sr.supervisor_id = ?
      ORDER BY sr.created_at DESC
    `;
    const [rows] = await db.execute(sql, [supervisor_id]);
    return rows;
  },

  updateStatus: async (id, status) => {
    const sql = `
      UPDATE supervisor_requests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [status, id]);
    return { affectedRows: result.affectedRows };
  }
};

module.exports = SupervisorRequest;
