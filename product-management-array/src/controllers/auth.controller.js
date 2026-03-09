/**
 * Auth Controller
 * ===============
 * Handles login/logout and authentication flows
 */

const userService = require('../services/user.service');

class AuthController {
  /**
   * Show login page
   */
  async showLoginPage(req, res) {
    if (req.session && req.session.user) {
      return res.redirect('/products');
    }
    res.render('auth/login', { title: 'Login' });
  }

  /**
   * Handle login
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).render('auth/login', {
          title: 'Login',
          error: 'Username and password are required',
        });
      }

      const user = await userService.login(username, password);

      // Set session
      req.session.user = user;

      // Redirect based on role
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }

      res.redirect('/products');
    } catch (error) {
      res.status(401).render('auth/login', {
        title: 'Login',
        error: error.message,
      });
    }
  }

  /**
   * Handle logout
   */
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/login');
    });
  }

  /**
   * Show register page
   */
  async showRegisterPage(req, res) {
    res.render('auth/register', { title: 'Register' });
  }

  /**
   * Handle register
   */
  async register(req, res) {
    try {
      const { username, password, passwordConfirm } = req.body;

      if (!username || !password || !passwordConfirm) {
        return res.status(400).render('auth/register', {
          title: 'Register',
          error: 'All fields are required',
        });
      }

      if (password !== passwordConfirm) {
        return res.status(400).render('auth/register', {
          title: 'Register',
          error: 'Passwords do not match',
        });
      }

      const user = await userService.register(username, password, 'staff');

      // Auto-login after registration
      req.session.user = {
        userId: user.userId,
        username: user.username,
        role: user.role,
      };

      res.redirect('/products');
    } catch (error) {
      res.status(400).render('auth/register', {
        title: 'Register',
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
