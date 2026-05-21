// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryModel = require('../models/categoryModel');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const categories = await categoryModel.getCategories();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const category = await categoryModel.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating category' });
  }
});

module.exports = router;
