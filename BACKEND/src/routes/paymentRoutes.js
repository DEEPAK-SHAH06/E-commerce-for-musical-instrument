// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// All payment initiation/verification routes require authentication
router.post('/esewa/initiate', authenticateToken, paymentController.initiateEsewa);
router.post('/khalti/initiate', authenticateToken, paymentController.initiateKhalti);
router.post('/verify', authenticateToken, paymentController.verifyPayment);

module.exports = router;
