const db = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const [userCount, contentCount, purchaseCount, revenue, recentUsers] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']),
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'video' THEN 1 END) as videos,
        COUNT(CASE WHEN type = 'document' THEN 1 END) as documents,
        COUNT(CASE WHEN type = 'audio' THEN 1 END) as audios,
        COUNT(CASE WHEN status = 'free' THEN 1 END) as free,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid
        FROM contents`),
      db.query('SELECT COUNT(*) FROM purchases WHERE status = $1', ['completed']),
      db.query('SELECT COALESCE(SUM(amount), 0) as total FROM purchases WHERE status = $1', ['completed']),
      db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10')
    ]);

    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      contents: contentCount.rows[0],
      totalPurchases: parseInt(purchaseCount.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      recentUsers: recentUsers.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, name, email, role, avatar, is_banned, created_at FROM users';
    const values = [];
    let paramIndex = 1;

    if (search) {
      query += ` WHERE name ILIKE $${paramIndex} OR email ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = query.replace(/SELECT id.*?FROM/, 'SELECT COUNT(*) FROM');
    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(parseInt(limit), offset);

    const [dataResult, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, values.slice(0, -2))
    ]);

    res.json({
      users: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, is_banned } = req.body;

    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot modify yourself.' });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (is_banned !== undefined) {
      updates.push(`is_banned = $${paramIndex++}`);
      values.push(is_banned);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, role, is_banned`;
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getAllContents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT c.*, cat.name as category_name, u.name as author_name FROM contents c LEFT JOIN categories cat ON c.category_id = cat.id LEFT JOIN users u ON c.uploaded_by = u.id WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND c.type = $${paramIndex++}`;
      values.push(type);
    }
    if (status) {
      query += ` AND c.status = $${paramIndex++}`;
      values.push(status);
    }

    const countQuery = query.replace(/SELECT c\.\*.*?FROM/, 'SELECT COUNT(*) FROM');
    query += ' ORDER BY c.created_at DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(parseInt(limit), offset);

    const [dataResult, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, values.slice(0, -2))
    ]);

    res.json({
      contents: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await db.query('INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *', [name, slug]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getPurchases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT p.*, u.name as user_name, u.email as user_email, c.title as content_title, c.type as content_type
       FROM purchases p
       JOIN users u ON p.user_id = u.id
       JOIN contents c ON p.content_id = c.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM purchases');

    res.json({
      purchases: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};
