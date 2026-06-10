const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

router.get('/', contentController.getAll);
router.get('/categories', contentController.getCategories);
router.get('/proxy/file', contentController.proxyFile);
router.get('/:id', contentController.getById);

router.post('/', authenticate, uploadFields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), contentController.create);
router.put('/:id', authenticate, uploadFields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), contentController.update);
router.delete('/:id', authenticate, contentController.remove);

module.exports = router;
