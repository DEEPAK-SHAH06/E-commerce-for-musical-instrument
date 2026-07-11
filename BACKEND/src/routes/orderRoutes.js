// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// All customer order routes require authentication
router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getUserOrders);
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
