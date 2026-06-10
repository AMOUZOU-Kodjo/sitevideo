const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.get('/contents', adminController.getAllContents);
router.get('/purchases', adminController.getPurchases);
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.get('/testimonials', adminController.getTestimonials);
router.put('/testimonials/:id/approve', adminController.approveTestimonial);
router.delete('/testimonials/:id', adminController.deleteTestimonial);

router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.get('/courses/:id/lessons', adminController.getLessons);
router.post('/courses/:courseId/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);
router.get('/lessons/:lessonId/quiz', adminController.getQuizQuestions);
router.post('/lessons/:lessonId/quiz', adminController.addQuizQuestion);
router.put('/quiz/:id', adminController.updateQuizQuestion);
router.delete('/quiz/:id', adminController.deleteQuizQuestion);
router.get('/courses/:courseId/quizzes', adminController.getCourseQuizzes);
router.post('/lessons/:lessonId/generate-quiz', adminController.generateQuizQuestions);
router.get('/forum', adminController.getAllForumTopics);
router.delete('/forum/:id', adminController.deleteForumTopic);
router.put('/forum/:id/pin', adminController.pinTopic);

router.get('/courses/:id/enrollments', adminController.getEnrollments);
router.get('/certificates', adminController.getAllCertificates);

module.exports = router;
