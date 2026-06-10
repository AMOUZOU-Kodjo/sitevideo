const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getAll);
router.get('/:key', settingsController.getByKey);
router.put('/', settingsController.update);
router.put('/bulk', settingsController.updateBulk);

module.exports = router;
