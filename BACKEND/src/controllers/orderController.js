// src/controllers/orderController.js
const orderModel = require('../models/orderModel');

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
    const { totalAmount, status, items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    const order = await orderModel.createOrder(req.user.id, totalAmount, status || 'Pending', items);
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  createOrder
};
