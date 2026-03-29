/**
 * Main Application File
 * =====================
 * Advanced Product Management System
 * - DynamoDB for data storage
 * - Session-based authentication
 * - Role-based access control (Admin/Staff)
 * - S3 for image storage
 * - Audit logging
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

// Configuration
const { initializeTables } = require('./config/database');

// Middleware
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ============================================
// CONFIGURATION
// ============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware - Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware - Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware - Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Middleware - Make user available in views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ============================================
// ROUTES
// ============================================

// Home redirect
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/products');
  }
  res.redirect('/login');
});

// Authentication routes (public)
app.use('/', authRoutes);

// Product routes (requires authentication)
app.use('/products', productRoutes);

// Category routes (requires authentication)
app.use('/categories', categoryRoutes);

// Admin routes (requires authentication + admin role)
app.use('/admin', adminRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    error: 'Page not found',
    status: 404,
  });
});

app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize DynamoDB tables
    await initializeTables();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║   🚀 Product Management System Started                     ║
║                                                            ║
║   Port: ${PORT}                                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║   Region: ${process.env.AWS_REGION || 'us-east-1'}                             ║
║                                                            ║
║   👉 Visit: http://localhost:${PORT}                      ║
║   📝 Login: /login                                         ║
║   📦 Products: /products                                   ║
║   ⚙️  Admin: /admin/dashboard                              ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
