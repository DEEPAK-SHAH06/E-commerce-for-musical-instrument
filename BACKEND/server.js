// BACKEND/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ── Health check ───────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── Routes ─────────────────────────────────────────────
const authRouter     = require('./src/routes/auth');
const productRouter  = require('./src/routes/productRoutes');
const categoryRouter = require('./src/routes/categoryRoutes');
const adminRouter    = require('./src/routes/adminRoutes');
const orderRouter    = require('./src/routes/orderRoutes');
const uploadRouter   = require('./src/routes/uploadRoutes');
const paymentRouter  = require('./src/routes/paymentRoutes');
const supportRouter  = require('./src/routes/supportRoutes');

app.use('/api/auth',       authRouter);
app.use('/api/products',   productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admin',      adminRouter);
app.use('/api/orders',     orderRouter);
app.use('/api/upload',     uploadRouter);
app.use('/api/payment',    paymentRouter);
app.use('/api/support',    supportRouter);

// ── Start server only when run directly (not during tests) ──
if (require.main === module) {
  const db = require('./src/config/db');
  db.query('SELECT NOW()')
    .then(() => {
      console.log('Database connection verified');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to database:', err.message);
      process.exit(1);
    });
}

module.exports = app;