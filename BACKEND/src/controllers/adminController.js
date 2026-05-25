// src/controllers/adminController.js
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

const getDashboardStats = async (req, res) => {
  try {
    const stats = await orderModel.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userModel.deleteUser(req.params.id);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser
};
