const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, purchaseController.purchase);
router.get('/mine', authenticate, purchaseController.getMyPurchases);
router.get('/check/:content_id', authenticate, purchaseController.checkAccess);

module.exports = router;
