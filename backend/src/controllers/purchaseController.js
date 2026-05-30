const db = require('../config/database');

exports.purchase = async (req, res, next) => {
  try {
    const { content_id } = req.body;

    if (!content_id) {
      return res.status(400).json({ error: 'Content ID is required.' });
    }

    const content = await db.query('SELECT * FROM contents WHERE id = $1 AND is_published = true', [content_id]);
    if (content.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    if (content.rows[0].status === 'free') {
      return res.status(400).json({ error: 'This content is free.' });
    }

    const existing = await db.query('SELECT id FROM purchases WHERE user_id = $1 AND content_id = $2', [req.user.id, content_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already purchased.' });
    }

    const result = await db.query(
      'INSERT INTO purchases (user_id, content_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, content_id, content.rows[0].price, 'completed']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getMyPurchases = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.title, c.type, c.description, c.youtube_id, c.file_url, c.thumbnail, c.status
       FROM purchases p
       JOIN contents c ON p.content_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.checkAccess = async (req, res, next) => {
  try {
    const { content_id } = req.params;

    const content = await db.query('SELECT status FROM contents WHERE id = $1', [content_id]);
    if (content.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    if (content.rows[0].status === 'free') {
      return res.json({ hasAccess: true, isFree: true });
    }

    const purchase = await db.query(
      'SELECT id FROM purchases WHERE user_id = $1 AND content_id = $2 AND status = $3',
      [req.user.id, content_id, 'completed']
    );

    res.json({ hasAccess: purchase.rows.length > 0, isFree: false });
  } catch (error) {
    next(error);
  }
};
