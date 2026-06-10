const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const result = await db.query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.getByKey = async (req, res, next) => {
  try {
    const result = await db.query('SELECT key, value FROM site_settings WHERE key = $1', [req.params.key]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Setting not found.' });
    res.json({ [result.rows[0].key]: result.rows[0].value });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Key and value are required.' });

    const result = await db.query(
      'INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW() RETURNING key, value',
      [key, JSON.stringify(value)]
    );
    res.json({ [result.rows[0].key]: result.rows[0].value });
  } catch (error) {
    next(error);
  }
};

exports.updateBulk = async (req, res, next) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Object of key-value pairs required.' });

    const keys = Object.keys(settings);
    for (const key of keys) {
      await db.query(
        'INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, JSON.stringify(settings[key])]
      );
    }
    res.json({ message: `${keys.length} settings updated.` });
  } catch (error) {
    next(error);
  }
};
