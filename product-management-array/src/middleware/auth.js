/**
 * Authentication & Authorization Middleware
 * =========================================
 * Handles user login/logout and role-based access control
 */

/**
 * Check if user is authenticated
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

/**
 * Check if user is admin
 * Must be called after isAuthenticated
 */
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}

/**
 * Check if user has specific role
 */
function hasRole(requiredRole) {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === requiredRole) {
      return next();
    }
    return res.status(403).json({ error: `${requiredRole} access required` });
  };
}

module.exports = {
  isAuthenticated,
  isAdmin,
  hasRole,
};
