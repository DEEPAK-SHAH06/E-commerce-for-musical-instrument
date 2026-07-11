// BACKEND/database/updateCategoryImages.js
require('dotenv').config();
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Mapping of category names to image files
const categoryImageMap = [
  { name: 'Electric Guitars', file: 'electricGuitar.png' },
  { name: 'Acoustic Guitars', file: 'acousticGuitar.jpg' },
  { name: 'Bass Guitars', file: 'bassGuitar.jpg' },
  { name: 'Digital Pianos', file: 'digitalPiano.jpeg' },
  { name: 'Synthesizers', file: 'synthesiser.jpeg' },
  { name: 'Drum Kits', file: 'drumKits.png' },
  { name: 'Cymbals', file: 'cyambals.jpg' },
  { name: 'Saxophones', file: 'saxophone.jpeg' }
];

const imagesSourceDir = path.join(__dirname, '../../FRONTEND/ThirdSemIndividual/images');
const frontendPublicDir = path.join(__dirname, '../../FRONTEND/ThirdSemIndividual/public/images');

async function uploadToCloudinary(filePath, categoryName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder: 'soundora_categories', public_id: categoryName.replace(/\s+/g, '_').toLowerCase() },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
}

async function run() {
  try {
    console.log('Starting category images update script...');
    console.log('Source Directory:', imagesSourceDir);

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';

    for (const item of categoryImageMap) {
      const sourcePath = path.join(imagesSourceDir, item.file);
      if (!fs.existsSync(sourcePath)) {
        console.warn(`⚠️ Warning: Image file not found: ${sourcePath}`);
        continue;
      }

      let imageUrl = null;

      if (isCloudinaryConfigured) {
        try {
          console.log(`Uploading ${item.file} to Cloudinary for category "${item.name}"...`);
          imageUrl = await uploadToCloudinary(sourcePath, item.name);
          console.log(`✅ Uploaded to Cloudinary: ${imageUrl}`);
        } catch (cloudinaryError) {
          console.error(`❌ Cloudinary upload failed for ${item.file}:`, cloudinaryError.message);
          console.log('Falling back to local static image delivery...');
        }
      }

      // Fallback/direct local delivery: copy file to public directory and use relative url
      if (!imageUrl) {
        if (!fs.existsSync(frontendPublicDir)) {
          fs.mkdirSync(frontendPublicDir, { recursive: true });
        }
        const destPath = path.join(frontendPublicDir, item.file);
        fs.copyFileSync(sourcePath, destPath);
        imageUrl = `/images/${item.file}`;
        console.log(`✅ Copied to frontend public folder and set URL to: ${imageUrl}`);
      }

      // Update Database
      console.log(`Updating DB category "${item.name}" with image_url = "${imageUrl}"...`);
      const res = await pool.query(
        'UPDATE categories SET image_url = $1, updated_at = NOW() WHERE name = $2 RETURNING id, name, image_url',
        [imageUrl, item.name]
      );

      if (res.rowCount > 0) {
        console.log(`🎉 DB Update Successful: ${res.rows[0].name} -> ${res.rows[0].image_url}`);
      } else {
        console.warn(`⚠️ Warning: Category "${item.name}" not found in database. No update performed.`);
      }
    }
  } catch (err) {
    console.error('❌ Error during script execution:', err);
  } finally {
    await pool.end();
    console.log('Script execution finished.');
  }
}

run();
