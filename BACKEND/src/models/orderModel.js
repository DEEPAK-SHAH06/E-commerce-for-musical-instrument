// src/models/orderModel.js
const db = require('../config/db');

async function getAllOrders() {
  const query = `
    SELECT o.*, o.total_amount as total_price, u.name as user_name, u.email as user_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC
  `;
  const { rows } = await db.query(query);
  return rows;
}

async function getOrderById(id) {
  const orderQuery = `
    SELECT o.*, o.total_amount as total_price, u.name as user_name, u.email as user_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    WHERE o.id = $1
  `;
  const itemsQuery = `
    SELECT oi.*, oi.unit_price as price, p.name as product_name, p.image_url 
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

async function getUserOrders(userId) {
  const query = `
    SELECT o.*, o.total_amount as total, o.total_amount as total_price, o.created_at as date
    FROM orders o 
    WHERE o.user_id = $1 
    ORDER BY o.created_at DESC
  `;
  const { rows: orders } = await db.query(query, [userId]);
  
  const itemsQuery = `
    SELECT oi.*, oi.unit_price as price, p.name as product_name, p.image_url 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = $1
  `;
  
  for (const order of orders) {
    const { rows: items } = await db.query(itemsQuery, [order.id]);
    order.items = items;
  }
  
  return orders;
}

async function createOrder(userId, totalAmount, status, items, paymentMethod = 'COD', paymentStatus = 'PENDING') {
  const pool = db.getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, status, payment_method, payment_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const orderResult = await client.query(orderQuery, [userId, totalAmount, status, paymentMethod, paymentStatus]);
    const order = orderResult.rows[0];
    
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4)
    `;
    for (const item of items) {
      await client.query(itemQuery, [order.id, item.id, item.quantity, item.price]);
      // Update stock
      await client.query('UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2', [item.quantity, item.id]);
    }
    
    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getDashboardStats() {
  const totalUsers = await db.query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
  const totalProducts = await db.query('SELECT COUNT(*) FROM products');
  const totalOrders = await db.query('SELECT COUNT(*) FROM orders');
  const totalRevenue = await db.query('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status != \'Cancelled\'');
  
  const cancelledOrdersResult = await db.query('SELECT COUNT(*) FROM orders WHERE status = \'Cancelled\'');
  const cancelledOrders = parseInt(cancelledOrdersResult.rows[0].count, 10);

  const totalItemsSoldResult = await db.query('SELECT COALESCE(SUM(quantity), 0) as sum FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status != \'Cancelled\'');
  const totalItemsSold = parseInt(totalItemsSoldResult.rows[0].sum, 10);

  const newCustomersResult = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= date_trunc('month', CURRENT_DATE)`);
  const newCustomers = parseInt(newCustomersResult.rows[0].count, 10);
  
  const recentOrders = await db.query(`
    SELECT o.*, o.total_amount as total_price, u.name as user_name 
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
      totalRevenue: parseFloat(totalRevenue.rows[0].sum),
      cancelledOrders,
      totalItemsSold,
      newCustomers
    },
    recentOrders: recentOrders.rows,
    salesByDay: (salesByDay.rows || []).map(row => ({
      ...row,
      revenue: parseFloat(row.revenue)
    })),
    salesByCategory: (salesByCategory.rows || []).map(row => ({
      ...row,
      count: parseInt(row.count, 10)
    }))
  };
}

async function updateOrderPaymentStatus(orderId, paymentStatus, orderStatus) {
  const query = 'UPDATE orders SET payment_status = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *';
  const { rows } = await db.query(query, [paymentStatus, orderStatus, orderId]);
  return rows[0];
}

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  createOrder,
  getDashboardStats,
  updateOrderPaymentStatus,
};
