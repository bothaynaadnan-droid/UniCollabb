const db = require('../config/DB');

const JoinRequest = {
  create: async ({ project_id, requester_student_id, desired_role, message }) => {
    const sql = `
      INSERT INTO join_requests (project_id, requester_student_id, desired_role, message, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    const [result] = await db.execute(sql, [
      project_id,
      requester_student_id,
      desired_role || null,
      message || null
    ]);
    return { id: result.insertId };
  },

  findPendingByProjectAndRequester: async (project_id, requester_student_id) => {
    const sql = `
      SELECT * FROM join_requests
      WHERE project_id = ? AND requester_student_id = ? AND status = 'pending'
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [project_id, requester_student_id]);
    return rows[0];
  },

  getById: async (id) => {
    const sql = `SELECT * FROM join_requests WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  listForCreatorStudent: async (creator_student_id) => {
    const sql = `
      SELECT
        jr.id,
        jr.project_id,
        p.title AS project_title,
        jr.requester_student_id,
        u.id AS requester_user_id,
        u.name AS requester_name,
        u.email AS requester_email,
        jr.desired_role,
        jr.message,
        jr.status,
        jr.created_at
      FROM join_requests jr
      JOIN projects p ON jr.project_id = p.id
      JOIN students rs ON jr.requester_student_id = rs.id
      JOIN users u ON rs.user_id = u.id
      WHERE p.creator_id = ?
      ORDER BY jr.created_at DESC
    `;
    const [rows] = await db.execute(sql, [creator_student_id]);
    return rows;
  },

  listForProject: async (project_id) => {
    const sql = `
      SELECT
        jr.id,
        jr.project_id,
        p.title AS project_title,
        jr.requester_student_id,
        u.id AS requester_user_id,
        u.name AS requester_name,
        u.email AS requester_email,
        jr.desired_role,
        jr.message,
        jr.status,
        jr.created_at
      FROM join_requests jr
      JOIN projects p ON jr.project_id = p.id
      JOIN students rs ON jr.requester_student_id = rs.id
      JOIN users u ON rs.user_id = u.id
      WHERE jr.project_id = ?
      ORDER BY jr.created_at DESC
    `;
    const [rows] = await db.execute(sql, [project_id]);
    return rows;
  },

  updateStatus: async (id, status) => {
    const sql = `
      UPDATE join_requests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [status, id]);
    return { affectedRows: result.affectedRows };
  }
};

module.exports = JoinRequest;
