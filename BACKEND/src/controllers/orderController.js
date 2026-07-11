// src/controllers/orderController.js
const orderModel = require('../models/orderModel');
const emailService = require('../services/emailService');

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderModel.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send email when status is set to Delivered
    if (status === 'Delivered') {
      try {
        const fullOrder = await orderModel.getOrderById(req.params.id);
        if (fullOrder && fullOrder.user_email) {
          console.log(`Triggering email delivery notification for Order #${req.params.id} to ${fullOrder.user_email}`);
          await emailService.sendOrderDeliveredEmail(
            fullOrder.user_email,
            fullOrder.user_name || 'Customer',
            fullOrder
          );
        }
      } catch (emailErr) {
        console.error('Failed to send order delivery notification email:', emailErr);
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel.getUserOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { totalAmount, status, items, paymentMethod, paymentStatus } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    const order = await orderModel.createOrder(
      req.user.id,
      totalAmount,
      status || 'Pending',
      items,
      paymentMethod || 'COD',
      paymentStatus || 'PENDING'
    );
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const orderDate = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = (now - orderDate) / (1000 * 60);

    if (diffMinutes > 30) {
      return res.status(400).json({ message: 'Order can only be cancelled within 30 minutes of placement' });
    }

    if (order.status === 'Cancelled' || order.status === 'Delivered') {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
    }

    const updatedOrder = await orderModel.updateOrderStatus(orderId, 'Cancelled');
    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  createOrder,
  cancelOrder
};
