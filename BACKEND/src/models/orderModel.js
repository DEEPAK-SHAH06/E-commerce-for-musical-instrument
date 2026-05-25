// src/models/orderModel.js
const db = require('../config/db');

async function getAllOrders() {
  const query = `
    SELECT o.*, u.name as user_name, u.email as user_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC
  `;
  const { rows } = await db.query(query);
  return rows;
}

async function getOrderById(id) {
  const orderQuery = `
    SELECT o.*, u.name as user_name, u.email as user_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    WHERE o.id = $1
  `;
  const itemsQuery = `
    SELECT oi.*, p.name as product_name, p.image_url 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = $1
  `;
  
  const orderResult = await db.query(orderQuery, [id]);
  if (orderResult.rows.length === 0) return null;
  
  const itemsResult = await db.query(itemsQuery, [id]);
  
  return {
    ...orderResult.rows[0],
    items: itemsResult.rows
  };
}

async function updateOrderStatus(id, status) {
  const query = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
  const { rows } = await db.query(query, [status, id]);
  return rows[0];
}

async function getDashboardStats() {
  const totalUsers = await db.query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
  const totalProducts = await db.query('SELECT COUNT(*) FROM products');
  const totalOrders = await db.query('SELECT COUNT(*) FROM orders');
  const totalRevenue = await db.query('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status != \'Cancelled\'');
  
  const recentOrders = await db.query(`
    SELECT o.*, u.name as user_name 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC 
    LIMIT 5
  `);

  const salesByDay = await db.query(`
    SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue 
    FROM orders 
    WHERE status != 'Cancelled' 
    GROUP BY DATE(created_at) 
    ORDER BY DATE(created_at) ASC 
    LIMIT 30
  `);

  const salesByCategory = await db.query(`
    SELECT c.name, COUNT(oi.id) as count 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    JOIN categories c ON p.category_id = c.id 
    GROUP BY c.name
  `);

  return {
    summary: {
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].sum)
    },
    recentOrders: recentOrders.rows,
    salesByDay: salesByDay.rows || [],
    salesByCategory: salesByCategory.rows || []
  };
}

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
};
