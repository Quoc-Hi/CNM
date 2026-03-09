/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

router.get('/dashboard', adminController.showDashboard.bind(adminController));
router.get('/logs', adminController.viewLogs.bind(adminController));
router.get('/inventory-report', adminController.inventoryReport.bind(adminController));

module.exports = router;
