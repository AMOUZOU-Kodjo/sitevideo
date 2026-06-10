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

module.exports = router;
