/**
 * Category Routes
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', isAuthenticated, categoryController.getCategories.bind(categoryController));
router.get('/:id', isAuthenticated, categoryController.getCategoryDetail.bind(categoryController));

// Admin only routes
router.get('/add-form', isAuthenticated, isAdmin, categoryController.showAddForm.bind(categoryController));
router.post('/add', isAuthenticated, isAdmin, categoryController.createCategory.bind(categoryController));
router.get('/:id/edit-form', isAuthenticated, isAdmin, categoryController.showEditForm.bind(categoryController));
router.post('/:id/update', isAuthenticated, isAdmin, categoryController.updateCategory.bind(categoryController));
router.get('/:id/delete', isAuthenticated, isAdmin, categoryController.deleteCategory.bind(categoryController));

module.exports = router;
