const db = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const [
      userCount,
      contentCount,
      purchaseCount,
      revenue,
      recentUsers,
      monthlyUsers,
      monthlyContents,
      monthlyRevenue,
      topContents,
      courseStats,
      recentEnrollments,
      recentCertificates
    ] = await Promise.all([
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
      db.query("SELECT COALESCE(SUM(amount), 0) as total FROM purchases WHERE status = $1", ['completed']),
      db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10'),
      db.query(`
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY month ASC
      `),
      db.query(`
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(CASE WHEN type = 'video' THEN 1 END) as videos,
          COUNT(CASE WHEN type = 'document' THEN 1 END) as documents,
          COUNT(CASE WHEN type = 'audio' THEN 1 END) as audios,
          COUNT(*) as total
        FROM contents
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY month ASC
      `),
      db.query(`
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as purchases,
          COALESCE(SUM(amount), 0) as revenue
        FROM purchases
        WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY month ASC
      `),
      db.query(`
        SELECT id, title, type, status, views_count, downloads_count
        FROM contents
        ORDER BY views_count DESC
        LIMIT 5
      `),
      db.query(`
        SELECT
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM lessons) as total_lessons,
          (SELECT COUNT(*) FROM enrollments) as total_enrollments,
          (SELECT COUNT(*) FROM enrollments WHERE status = 'completed') as completed_enrollments,
          (SELECT COUNT(*) FROM certificates) as total_certificates
      `),
      db.query(`
        SELECT e.*, u.name as user_name, c.title as course_title
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.started_at DESC LIMIT 5
      `),
      db.query(`
        SELECT cert.*, u.name as user_name, c.title as course_title
        FROM certificates cert
        JOIN users u ON cert.user_id = u.id
        JOIN courses c ON cert.course_id = c.id
        ORDER BY cert.issued_at DESC LIMIT 5
      `)
    ]);

    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      contents: {
        ...contentCount.rows[0],
        total: parseInt(contentCount.rows[0].total),
        videos: parseInt(contentCount.rows[0].videos),
        documents: parseInt(contentCount.rows[0].documents),
        audios: parseInt(contentCount.rows[0].audios),
        free: parseInt(contentCount.rows[0].free),
        paid: parseInt(contentCount.rows[0].paid)
      },
      totalPurchases: parseInt(purchaseCount.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      recentUsers: recentUsers.rows,
      monthlyUsers: monthlyUsers.rows,
      monthlyContents: monthlyContents.rows,
      monthlyRevenue: monthlyRevenue.rows,
      topContents: topContents.rows,
      courses: courseStats.rows[0],
      recentEnrollments: recentEnrollments.rows,
      recentCertificates: recentCertificates.rows
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

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await db.query(
      'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
      [name, slug, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(con.id) as content_count
      FROM categories c
      LEFT JOIN contents con ON c.id = con.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(result.rows);
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

exports.getTestimonials = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM testimonials';
    const values = [];
    let paramIndex = 1;

    if (approved === 'true') {
      query += ` WHERE is_approved = true`;
    } else if (approved === 'false') {
      query += ` WHERE is_approved = false`;
    }

    const countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*)');
    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(parseInt(limit), offset);

    const [dataResult, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, values.slice(0, -2))
    ]);

    res.json({
      testimonials: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

exports.approveTestimonial = async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE testimonials SET is_approved = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json({ message: 'Testimonial deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getAllCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, difficulty } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const values = [];
    let paramIndex = 1;
    let where = '';

    if (difficulty) {
      where = ` WHERE c.difficulty = $${paramIndex++}`;
      values.push(difficulty);
    }

    const dataResult = await db.query(
      `SELECT c.*, u.name as author_name,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id${where}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, parseInt(limit), offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM courses c${where}`,
      values
    );

    res.json({
      courses: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) { next(error); }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, difficulty, thumbnail, is_published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await db.query(
      'INSERT INTO courses (title, description, slug, difficulty, thumbnail, is_published, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, slug, difficulty || 'beginner', thumbnail, is_published !== false, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { title, description, difficulty, thumbnail, is_published } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (difficulty !== undefined) { updates.push(`difficulty = $${paramIndex++}`); values.push(difficulty); }
    if (thumbnail !== undefined) { updates.push(`thumbnail = $${paramIndex++}`); values.push(thumbnail); }
    if (is_published !== undefined) { updates.push(`is_published = $${paramIndex++}`); values.push(is_published); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update.' });
    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    const result = await db.query(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    await db.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Course deleted.' });
  } catch (error) { next(error); }
};

exports.getLessons = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
};

exports.createLesson = async (req, res, next) => {
  try {
    const { title, description, type, youtube_id, file_url, content, duration, order_index, is_free } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'Title and type are required.' });

    const maxOrder = await db.query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next FROM lessons WHERE course_id = $1',
      [req.params.courseId]
    );

    const result = await db.query(
      `INSERT INTO lessons (course_id, title, description, type, youtube_id, file_url, content, duration, order_index, is_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.params.courseId, title, description, type, youtube_id, file_url, content, duration, order_index ?? maxOrder.rows[0].next, is_free !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const { title, description, type, youtube_id, file_url, content, duration, order_index, is_free } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (type !== undefined) { updates.push(`type = $${paramIndex++}`); values.push(type); }
    if (youtube_id !== undefined) { updates.push(`youtube_id = $${paramIndex++}`); values.push(youtube_id); }
    if (file_url !== undefined) { updates.push(`file_url = $${paramIndex++}`); values.push(file_url); }
    if (content !== undefined) { updates.push(`content = $${paramIndex++}`); values.push(content); }
    if (duration !== undefined) { updates.push(`duration = $${paramIndex++}`); values.push(duration); }
    if (order_index !== undefined) { updates.push(`order_index = $${paramIndex++}`); values.push(order_index); }
    if (is_free !== undefined) { updates.push(`is_free = $${paramIndex++}`); values.push(is_free); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update.' });
    values.push(req.params.id);

    const result = await db.query(
      `UPDATE lessons SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found.' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    await db.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);
    res.json({ message: 'Lesson deleted.' });
  } catch (error) { next(error); }
};

exports.getQuizQuestions = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM quizzes WHERE lesson_id = $1 ORDER BY order_index ASC',
      [req.params.lessonId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
};

exports.addQuizQuestion = async (req, res, next) => {
  try {
    const { question, options, correct_answer, explanation } = req.body;
    if (!question || !options || !correct_answer) return res.status(400).json({ error: 'Question, options, and correct_answer are required.' });

    const lesson = await db.query('SELECT course_id FROM lessons WHERE id = $1', [req.params.lessonId]);
    if (lesson.rows.length === 0) return res.status(404).json({ error: 'Lesson not found.' });

    const maxOrder = await db.query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next FROM quizzes WHERE lesson_id = $1',
      [req.params.lessonId]
    );

    const result = await db.query(
      'INSERT INTO quizzes (lesson_id, course_id, question, options, correct_answer, explanation, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.params.lessonId, lesson.rows[0].course_id, question, JSON.stringify(options), correct_answer, explanation, maxOrder.rows[0].next]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.updateQuizQuestion = async (req, res, next) => {
  try {
    const { question, options, correct_answer, explanation } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (question !== undefined) { updates.push(`question = $${paramIndex++}`); values.push(question); }
    if (options !== undefined) { updates.push(`options = $${paramIndex++}`); values.push(JSON.stringify(options)); }
    if (correct_answer !== undefined) { updates.push(`correct_answer = $${paramIndex++}`); values.push(correct_answer); }
    if (explanation !== undefined) { updates.push(`explanation = $${paramIndex++}`); values.push(explanation); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update.' });
    values.push(req.params.id);

    const result = await db.query(
      `UPDATE quizzes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Quiz not found.' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.deleteQuizQuestion = async (req, res, next) => {
  try {
    await db.query('DELETE FROM quizzes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Quiz question deleted.' });
  } catch (error) { next(error); }
};

exports.getCourseQuizzes = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT q.*, l.title as lesson_title, l.order_index as lesson_order
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       WHERE q.course_id = $1
       ORDER BY l.order_index ASC, q.order_index ASC`,
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
};

exports.generateQuizQuestions = async (req, res, next) => {
  try {
    const { count = 3, topic } = req.body;
    const lesson = await db.query('SELECT * FROM lessons WHERE id = $1', [req.params.lessonId]);
    if (lesson.rows.length === 0) return res.status(404).json({ error: 'Lesson not found.' });

    const lessonTitle = lesson.rows[0].title;
    const lessonContent = lesson.rows[0].content || lessonTitle;
    const courseId = lesson.rows[0].course_id;

    const maxOrder = await db.query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next FROM quizzes WHERE lesson_id = $1',
      [req.params.lessonId]
    );

    const generated = [];
    const questionCount = Math.min(count, 10);

    for (let i = 0; i < questionCount; i++) {
      const order = parseInt(maxOrder.rows[0].next) + i;
      const result = await db.query(
        `INSERT INTO quizzes (lesson_id, course_id, question, options, correct_answer, explanation, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          req.params.lessonId, courseId,
          `Question ${order + 1} sur : "${lessonTitle}"`,
          JSON.stringify(['Option A (Réponse correcte)', 'Option B', 'Option C', 'Option D']),
          'Option A (Réponse correcte)',
          `Cette question est basée sur la leçon "${lessonTitle}". Modifiez le contenu après génération.`,
          order
        ]
      );
      generated.push(result.rows[0]);
    }

    res.status(201).json({ message: `${generated.length} questions générées`, quizzes: generated });
  } catch (error) { next(error); }
};

exports.getAllForumTopics = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT ft.*, u.name as user_name, c.title as course_title,
        (SELECT COUNT(*) FROM forum_replies WHERE topic_id = ft.id) as reply_count
       FROM forum_topics ft
       JOIN users u ON ft.user_id = u.id
       LEFT JOIN courses c ON ft.course_id = c.id
       ORDER BY ft.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM forum_topics');

    res.json({
      topics: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) { next(error); }
};

exports.deleteForumTopic = async (req, res, next) => {
  try {
    await db.query('DELETE FROM forum_topics WHERE id = $1', [req.params.id]);
    res.json({ message: 'Forum topic deleted.' });
  } catch (error) { next(error); }
};

exports.pinTopic = async (req, res, next) => {
  try {
    const topic = await db.query('SELECT is_pinned FROM forum_topics WHERE id = $1', [req.params.id]);
    if (topic.rows.length === 0) return res.status(404).json({ error: 'Topic not found.' });

    const result = await db.query(
      'UPDATE forum_topics SET is_pinned = $1 WHERE id = $2 RETURNING *',
      [!topic.rows[0].is_pinned, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { next(error); }
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

exports.getEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT e.*, u.name as user_name, u.email as user_email, c.title as course_title
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.course_id = $1
       ORDER BY e.started_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.id, parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM enrollments WHERE course_id = $1', [req.params.id]);

    res.json({
      enrollments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) { next(error); }
};

exports.getAllCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT cert.*, u.name as user_name, u.email as user_email, c.title as course_title
       FROM certificates cert
       JOIN users u ON cert.user_id = u.id
       JOIN courses c ON cert.course_id = c.id
       ORDER BY cert.issued_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM certificates');

    res.json({
      certificates: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (error) { next(error); }
};
