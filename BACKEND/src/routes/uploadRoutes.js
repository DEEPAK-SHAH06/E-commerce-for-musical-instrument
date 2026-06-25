// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Configure Multer memory storage (files stored in memory buffers temporarily)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Admin-only image upload endpoint
router.post('/', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  // Graceful fallback if Cloudinary is not configured in .env
  const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';

  if (!isCloudinaryConfigured) {
    console.warn('WARNING: Cloudinary credentials not configured in .env. Returning a high-quality instrument placeholder.');
    // Return a beautiful unsplash image as placeholder
    return res.json({
      secure_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      message: 'Cloudinary not configured. Using high-quality placeholder.'
    });
  }

  // Upload memory buffer directly to Cloudinary using write stream
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'soundora_products' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
      }
      res.json({ secure_url: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

module.exports = router;
