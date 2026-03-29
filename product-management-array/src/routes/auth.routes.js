/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/login', authController.showLoginPage.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/logout', authController.logout.bind(authController));

router.get('/register', authController.showRegisterPage.bind(authController));
router.post('/register', authController.register.bind(authController));

module.exports = router;
