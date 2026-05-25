// src/controllers/productController.js
const productModel = require('../models/productModel');

const getProducts = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      brand: req.query.brand,
      priceMin: req.query.priceMin,
      priceMax: req.query.priceMax,
      instrumentType: req.query.instrumentType,
      categoryId: req.query.categoryId,
      categoryName: req.query.categoryName,
      search: req.query.search,
      sortBy: req.query.sortBy
    };
    const result = await productModel.getProducts(filters);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productModel.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productModel.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await productModel.deleteProduct(req.params.id);
    if (!result) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
