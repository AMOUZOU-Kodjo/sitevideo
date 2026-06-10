const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { difficulty, search } = req.query;
    let query = 'SELECT c.*, u.name as author_name FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.is_published = true';
    const values = [];
    let paramIndex = 1;

    if (difficulty) {
      query += ` AND c.difficulty = $${paramIndex++}`;
      values.push(difficulty);
    }
    if (search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY c.created_at DESC';
    const result = await db.query(query, values);

    const lessonCounts = await db.query(
      'SELECT course_id, COUNT(*) as lesson_count FROM lessons WHERE course_id = ANY($1) GROUP BY course_id',
      [result.rows.map(r => r.id)]
    );

    const countMap = {};
    lessonCounts.rows.forEach(r => { countMap[r.course_id] = parseInt(r.lesson_count); });

    res.json(result.rows.map(c => ({
      ...c,
      lesson_count: countMap[c.id] || 0
    })));
  } catch (error) { next(error); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const course = await db.query(
      'SELECT c.*, u.name as author_name FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.slug = $1 AND c.is_published = true',
      [req.params.slug]
    );
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const lessons = await db.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [course.rows[0].id]
    );

    res.json({ ...course.rows[0], lessons: lessons.rows });
  } catch (error) { next(error); }
};

exports.getLessons = async (req, res, next) => {
  try {
    const course = await db.query('SELECT id FROM courses WHERE slug = $1', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const lessons = await db.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [course.rows[0].id]
    );
    res.json(lessons.rows);
  } catch (error) { next(error); }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM quizzes WHERE lesson_id = $1 ORDER BY order_index ASC',
      [req.params.lessonId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answer } = req.body;
    const quiz = await db.query('SELECT * FROM quizzes WHERE id = $1', [req.params.quizId]);
    if (quiz.rows.length === 0) return res.status(404).json({ error: 'Quiz not found.' });

    const isCorrect = answer.trim().toLowerCase() === quiz.rows[0].correct_answer.trim().toLowerCase();

    await db.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, answer, is_correct) VALUES ($1, $2, $3, $4)',
      [req.user.id, req.params.quizId, answer, isCorrect]
    );

    res.json({ is_correct: isCorrect, correct_answer: quiz.rows[0].correct_answer, explanation: quiz.rows[0].explanation });
  } catch (error) { next(error); }
};

exports.getForumTopics = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const values = [parseInt(limit), offset];
    let paramIndex = 3;

    const course = await db.query('SELECT id FROM courses WHERE slug = $1', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const countResult = await db.query('SELECT COUNT(*) FROM forum_topics WHERE course_id = $1', [course.rows[0].id]);

    const topics = await db.query(
      `SELECT ft.*, u.name as user_name, u.avatar as user_avatar,
        (SELECT COUNT(*) FROM forum_replies WHERE topic_id = ft.id) as reply_count
       FROM forum_topics ft
       JOIN users u ON ft.user_id = u.id
       WHERE ft.course_id = $1
       ORDER BY ft.is_pinned DESC, ft.created_at DESC
       LIMIT $2 OFFSET $3`,
      [course.rows[0].id, ...values]
    );

    res.json({
      topics: topics.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) { next(error); }
};

exports.createForumTopic = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });

    const course = await db.query('SELECT id FROM courses WHERE slug = $1', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const result = await db.query(
      'INSERT INTO forum_topics (course_id, user_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [course.rows[0].id, req.user.id, title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.getTopicReplies = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT fr.*, u.name as user_name, u.avatar as user_avatar
       FROM forum_replies fr
       JOIN users u ON fr.user_id = u.id
       WHERE fr.topic_id = $1
       ORDER BY fr.created_at ASC`,
      [req.params.topicId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
};

exports.enroll = async (req, res, next) => {
  try {
    const course = await db.query('SELECT id FROM courses WHERE slug = $1 AND is_published = true', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const existing = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, course.rows[0].id]
    );
    if (existing.rows.length > 0) return res.json(existing.rows[0]);

    const result = await db.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, course.rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.getEnrollment = async (req, res, next) => {
  try {
    const course = await db.query('SELECT id FROM courses WHERE slug = $1', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const enrollment = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, course.rows[0].id]
    );

    const progress = await db.query(
      `SELECT lp.*, l.title as lesson_title, l.type as lesson_type
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.user_id = $1 AND l.course_id = $2
       ORDER BY l.order_index ASC`,
      [req.user.id, course.rows[0].id]
    );

    const total = await db.query('SELECT COUNT(*) as count FROM lessons WHERE course_id = $1', [course.rows[0].id]);

    res.json({
      enrollment: enrollment.rows[0] || null,
      progress: progress.rows,
      totalLessons: parseInt(total.rows[0].count),
      completedLessons: progress.rows.filter(p => p.completed).length
    });
  } catch (error) { next(error); }
};

exports.completeLesson = async (req, res, next) => {
  try {
    const course = await db.query('SELECT id FROM courses WHERE slug = $1', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const lesson = await db.query(
      'SELECT * FROM lessons WHERE id = $1 AND course_id = $2',
      [req.params.lessonId, course.rows[0].id]
    );
    if (lesson.rows.length === 0) return res.status(404).json({ error: 'Lesson not found.' });

    await db.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = NOW()`,
      [req.user.id, req.params.lessonId]
    );

    const total = await db.query('SELECT COUNT(*) as count FROM lessons WHERE course_id = $1', [course.rows[0].id]);
    const done = await db.query(
      `SELECT COUNT(*) as count FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.user_id = $1 AND l.course_id = $2 AND lp.completed = true`,
      [req.user.id, course.rows[0].id]
    );

    const progress = Math.round((parseInt(done.rows[0].count) / parseInt(total.rows[0].count)) * 100);

    if (parseInt(done.rows[0].count) >= parseInt(total.rows[0].count)) {
      const certId = `CERT-${course.rows[0].id.slice(0, 8)}-${req.user.id.slice(0, 8)}-${Date.now()}`.toUpperCase();
      await db.query(
        `INSERT INTO certificates (user_id, course_id, certificate_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [req.user.id, course.rows[0].id, certId]
      );
      await db.query(
        'UPDATE enrollments SET status = $1, progress = $2, completed_at = NOW() WHERE user_id = $3 AND course_id = $4',
        ['completed', 100, req.user.id, course.rows[0].id]
      );
    } else {
      await db.query(
        'UPDATE enrollments SET progress = $1 WHERE user_id = $2 AND course_id = $3',
        [progress, req.user.id, course.rows[0].id]
      );
    }

    res.json({ completed: true, progress, allDone: parseInt(done.rows[0].count) >= parseInt(total.rows[0].count) });
  } catch (error) { next(error); }
};

exports.getCertificate = async (req, res, next) => {
  try {
    const course = await db.query('SELECT id, title FROM courses WHERE slug = $1', [req.params.slug]);
    if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const cert = await db.query(
      `SELECT cert.*, u.name as user_name, c.title as course_title
       FROM certificates cert
       JOIN users u ON cert.user_id = u.id
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.user_id = $1 AND cert.course_id = $2`,
      [req.user.id, course.rows[0].id]
    );

    if (cert.rows.length === 0) return res.status(404).json({ error: 'No certificate yet.' });
    res.json(cert.rows[0]);
  } catch (error) { next(error); }
};

exports.createReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required.' });

    const result = await db.query(
      'INSERT INTO forum_replies (topic_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.topicId, req.user.id, content]
    );

    await db.query('UPDATE forum_topics SET updated_at = NOW() WHERE id = $1', [req.params.topicId]);

    const user = await db.query('SELECT name, avatar FROM users WHERE id = $1', [req.user.id]);
    res.status(201).json({ ...result.rows[0], user_name: user.rows[0].name, user_avatar: user.rows[0].avatar });
  } catch (error) { next(error); }
};
