const Planner = require('../models/PlannerModel');

function requireAuthUser(req) {
  if (!req.user?.id) {
    return null;
  }
  return req.user.id;
}

function normalizeBucket(req) {
  return String(req.params.bucket || '').toLowerCase();
}

exports.getBucket = async (req, res) => {
  try {
    const userId = requireAuthUser(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const bucket = normalizeBucket(req);
    const data = await Planner.get(bucket, userId);

    // If no row yet, return sensible defaults
    if (data == null) {
      const fallback = bucket === 'whiteboard' ? {} : [];
      return res.json({ success: true, data: fallback });
    }

    return res.json({ success: true, data });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status !== 500) {
      return res.status(status).json({ success: false, message: error.message || 'Invalid request' });
    }

    console.error('Planner getBucket error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.putBucket = async (req, res) => {
  try {
    const userId = requireAuthUser(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const bucket = normalizeBucket(req);
    const payload = req.body?.data;

    // Very light validation to avoid storing huge payloads accidentally.
    const asString = payload == null ? '' : JSON.stringify(payload);
    if (asString.length > 2_000_000) {
      return res.status(413).json({ success: false, message: 'Payload too large' });
    }

    await Planner.upsert(bucket, userId, payload);
    return res.json({ success: true, message: 'Saved' });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status !== 500) {
      return res.status(status).json({ success: false, message: error.message || 'Invalid request' });
    }

    console.error('Planner putBucket error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
