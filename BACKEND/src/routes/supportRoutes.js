const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Route for submitting a support ticket
router.post('/ticket', supportController.submitTicket);

module.exports = router;
