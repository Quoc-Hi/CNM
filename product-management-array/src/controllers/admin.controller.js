/**
 * Admin Controller
 * ================
 * Admin dashboard and system management
 */

const productService = require('../services/product.service');
const categoryService = require('../services/category.service');

class AdminController {
  /**
   * Show admin dashboard
   */
  async showDashboard(req, res) {
    try {
      // Get statistics
      const productsResult = await productService.getAllProducts(1, 1000);
      const categories = await categoryService.getAllCategories();
      const allLogs = await productService.getAllLogs(1, 100);

      const totalProducts = productsResult.total;
      const totalCategories = categories.length;

      // Calculate inventory stats
      let lowStockProducts = 0;
      let outOfStockProducts = 0;

      productsResult.items.forEach((p) => {
        if (p.quantity === 0) outOfStockProducts++;
        else if (p.quantity < 5) lowStockProducts++;
      });

      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats: {
          totalProducts,
          totalCategories,
          lowStockProducts,
          outOfStockProducts,
        },
        recentLogs: allLogs.items.slice(0, 10),
        user: req.session.user,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * View all audit logs
   */
  async viewLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 50;

      const result = await productService.getAllLogs(page, limit);

      res.render('admin/logs', {
        title: 'Audit Logs',
        logs: result.items,
        pagination: {
          current: result.page,
          total: result.pages,
          pages: Array.from({ length: result.pages }, (_, i) => i + 1),
          hasNext: result.page < result.pages,
          hasPrev: result.page > 1,
        },
        user: req.session.user,
      });
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * View inventory report
   */
  async inventoryReport(req, res) {
    try {
      const result = await productService.getAllProducts(1, 1000);

      const inventory = {
        inStock: result.items.filter((p) => p.quantity > 5),
        lowStock: result.items.filter((p) => p.quantity > 0 && p.quantity <= 5),
        outOfStock: result.items.filter((p) => p.quantity === 0),
      };

      res.render('admin/inventory-report', {
        title: 'Inventory Report',
        inventory,
        summary: {
          total: result.items.length,
          inStockCount: inventory.inStock.length,
          lowStockCount: inventory.lowStock.length,
          outOfStockCount: inventory.outOfStock.length,
        },
        user: req.session.user,
      });
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  }
}

module.exports = new AdminController();
