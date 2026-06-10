const { contactEmail } = require('../services/email');

exports.send = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    await contactEmail({ name, email, subject, message });

    res.json({ success: true, message: 'Message envoyé avec succès.' });
  } catch (error) {
    next(error);
  }
};
