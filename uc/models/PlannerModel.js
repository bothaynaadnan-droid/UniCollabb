const db = require('../config/DB');

const TABLES = {
  drafts: 'planner_drafts',
  tasks: 'planner_tasks',
  whiteboard: 'planner_whiteboard',
  events: 'planner_events'
};

function assertBucket(bucket) {
  if (!Object.prototype.hasOwnProperty.call(TABLES, bucket)) {
    const err = new Error('Invalid bucket');
    err.statusCode = 400;
    throw err;
  }
}

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

const Planner = {
  async get(bucket, userId) {
    assertBucket(bucket);
    const table = TABLES[bucket];
    const sql = `SELECT data FROM ${table} WHERE user_id = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [userId]);
    const row = rows[0];
    if (!row) return null;

    // For list buckets default to [], for whiteboard default to {}
    const fallback = bucket === 'whiteboard' ? {} : [];
    return safeJsonParse(row.data, fallback);
  },

  async upsert(bucket, userId, value) {
    assertBucket(bucket);
    const table = TABLES[bucket];
    const data = value == null ? null : JSON.stringify(value);

    const sql = `
      INSERT INTO ${table} (user_id, data)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP
    `;

    const [result] = await db.execute(sql, [userId, data]);
    return { affectedRows: result.affectedRows };
  }
};

module.exports = Planner;
