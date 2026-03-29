/**
 * Category Controller
 * ===================
 * Handles category CRUD operations (admin only)
 */

const categoryService = require('../services/category.service');

class CategoryController {
  /**
   * Get all categories
   */
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();

      res.render('categories/list', {
        title: 'Categories',
        categories,
        user: req.session.user,
      });
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * Show add category form
   */
  async showAddForm(req, res) {
    res.render('categories/add', {
      title: 'Add Category',
      user: req.session.user,
    });
  }

  /**
   * Create category
   */
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).render('categories/add', {
          title: 'Add Category',
          error: 'Category name is required',
          user: req.session.user,
        });
      }

      await categoryService.createCategory(name, description);
      res.redirect('/categories');
    } catch (error) {
      res.status(400).render('categories/add', {
        title: 'Add Category',
        error: error.message,
        user: req.session.user,
      });
    }
  }

  /**
   * Show edit form
   */
  async showEditForm(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);

      res.render('categories/edit', {
        title: `Edit - ${category.name}`,
        category,
        user: req.session.user,
      });
    } catch (error) {
      res.status(404).render('error', { error: error.message });
    }
  }

  /**
   * Update category
   */
  async updateCategory(req, res) {
    try {
      const { name, description } = req.body;
      const categoryId = req.params.id;

      if (!name) {
        const category = await categoryService.getCategoryById(categoryId);
        return res.status(400).render('categories/edit', {
          title: `Edit - ${category.name}`,
          category,
          error: 'Category name is required',
          user: req.session.user,
        });
      }

      await categoryService.updateCategory(categoryId, name, description);
      res.redirect('/categories');
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete category
   * Note: Products are NOT deleted (business rule)
   */
  async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.redirect('/categories');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Show category detail with products
   */
  async getCategoryDetail(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      const products = await categoryService.getProductsByCategory(req.params.id);

      // Add inventory status
      products.forEach((p) => {
        p.inventoryStatus = require('../services/product.service').getInventoryStatus(p.quantity);
        p.inventoryStatusClass = require('../services/product.service').getInventoryStatusClass(p.quantity);
      });

      res.render('categories/detail', {
        title: category.name,
        category,
        products,
        user: req.session.user,
      });
    } catch (error) {
      res.status(404).render('error', { error: error.message });
    }
  }
}

module.exports = new CategoryController();
