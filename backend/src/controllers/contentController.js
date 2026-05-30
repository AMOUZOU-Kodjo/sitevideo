const db = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res, next) => {
  try {
    const { type, status, category, search, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT c.*, cat.name as category_name, u.name as author_name FROM contents c LEFT JOIN categories cat ON c.category_id = cat.id LEFT JOIN users u ON c.uploaded_by = u.id WHERE c.is_published = true';
    const values = [];
    const conditions = [];
    let paramIndex = 1;

    if (type) {
      conditions.push(`c.type = $${paramIndex++}`);
      values.push(type);
    }
    if (status) {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(status);
    }
    if (category) {
      conditions.push(`c.category_id = $${paramIndex++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
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

exports.getById = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT c.*, cat.name as category_name, u.name as author_name FROM contents c LEFT JOIN categories cat ON c.category_id = cat.id LEFT JOIN users u ON c.uploaded_by = u.id WHERE c.id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    await db.query('UPDATE contents SET views_count = views_count + 1 WHERE id = $1', [req.params.id]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, type, status, price, youtube_id, category_id } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required.' });
    }

    let file_url = null;
    if (req.file) {
      file_url = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      `INSERT INTO contents (title, description, type, status, price, youtube_id, file_url, category_id, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, type, status || 'free', price || 0, youtube_id, file_url, category_id, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await db.query('SELECT * FROM contents WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    const { title, description, status, price, youtube_id, category_id, is_published } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
    if (price !== undefined) { updates.push(`price = $${paramIndex++}`); values.push(price); }
    if (youtube_id !== undefined) { updates.push(`youtube_id = $${paramIndex++}`); values.push(youtube_id); }
    if (category_id !== undefined) { updates.push(`category_id = $${paramIndex++}`); values.push(category_id); }
    if (is_published !== undefined) { updates.push(`is_published = $${paramIndex++}`); values.push(is_published); }
    if (req.file) {
      if (existing.rows[0].file_url) {
        const oldPath = path.join(__dirname, '../../', existing.rows[0].file_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.push(`file_url = $${paramIndex++}`);
      values.push(`/uploads/${req.file.filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const query = `UPDATE contents SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM contents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    if (result.rows[0].file_url) {
      const filePath = path.join(__dirname, '../../', result.rows[0].file_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM contents WHERE id = $1', [req.params.id]);
    res.json({ message: 'Content deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
