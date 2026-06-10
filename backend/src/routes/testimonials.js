const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

router.get('/', testimonialController.getAll);
router.post('/', testimonialController.create);

module.exports = router;
