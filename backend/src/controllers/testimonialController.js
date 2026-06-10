const db = require('../config/database');
const { testimonialEmail } = require('../services/email');

exports.getAll = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, role, content, rating, created_at FROM testimonials WHERE is_approved = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, role, content, rating } = req.body;

    if (!name || !content || !rating) {
      return res.status(400).json({ error: 'Nom, contenu et note sont requis.' });
    }

    const result = await db.query(
      'INSERT INTO testimonials (name, role, content, rating, is_approved) VALUES ($1, $2, $3, $4, true) RETURNING id, name, role, content, rating, created_at',
      [name, role || '', content, rating]
    );

    testimonialEmail({ name, role, content, rating });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
