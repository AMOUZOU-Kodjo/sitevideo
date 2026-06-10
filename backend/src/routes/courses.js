const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', courseController.getAll);
router.get('/:slug', courseController.getBySlug);
router.get('/:slug/lessons', courseController.getLessons);
router.get('/:slug/quiz/:lessonId', courseController.getQuiz);
router.post('/quiz/:quizId/attempt', authenticate, courseController.submitQuiz);
router.get('/:slug/forum', courseController.getForumTopics);
router.post('/:slug/forum', authenticate, courseController.createForumTopic);
router.get('/forum/:topicId/replies', courseController.getTopicReplies);
router.post('/forum/:topicId/reply', authenticate, courseController.createReply);

router.post('/:slug/enroll', authenticate, courseController.enroll);
router.get('/:slug/enrollment', authenticate, courseController.getEnrollment);
router.post('/:slug/lessons/:lessonId/complete', authenticate, courseController.completeLesson);
router.get('/:slug/certificate', authenticate, courseController.getCertificate);

module.exports = router;
