/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes (authenticated users can view)
router.get('/', isAuthenticated, productController.getProducts.bind(productController));
router.get('/search', isAuthenticated, productController.searchProducts.bind(productController));
router.get('/:id', isAuthenticated, productController.getProductDetail.bind(productController));

// Admin only routes
router.get('/add-form', isAuthenticated, isAdmin, productController.showAddForm.bind(productController));
router.post('/add', isAuthenticated, isAdmin, productController.createProduct.bind(productController));
router.get('/:id/edit-form', isAuthenticated, isAdmin, productController.showEditForm.bind(productController));
router.post('/:id/update', isAuthenticated, isAdmin, productController.updateProduct.bind(productController));
router.get('/:id/delete', isAuthenticated, isAdmin, productController.deleteProduct.bind(productController));

module.exports = router;
