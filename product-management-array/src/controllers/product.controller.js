/**
 * Product Controller
 * ==================
 * Handles product CRUD and related operations
 */

const productService = require('../services/product.service');
const categoryService = require('../services/category.service');
const s3Service = require('../services/s3.service');

class ProductController {
  /**
   * Get all products (staff & admin can view)
   */
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await productService.getAllProducts(page, limit);

      // Add inventory status to each product
      result.items = result.items.map((product) => ({
        ...product,
        inventoryStatus: productService.getInventoryStatus(product.quantity),
        inventoryStatusClass: productService.getInventoryStatusClass(
          product.quantity
        ),
      }));

      res.render('products/list', {
        title: 'Products',
        products: result.items,
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
      console.error('Error fetching products:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * Search and filter products
   */
  async searchProducts(req, res) {
    try {
      const {
        name,
        categoryId,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
      } = req.query;

      const result = await productService.searchProducts({
        name,
        categoryId,
        minPrice,
        maxPrice,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      // Add inventory status
      result.items = result.items.map((product) => ({
        ...product,
        inventoryStatus: productService.getInventoryStatus(product.quantity),
        inventoryStatusClass: productService.getInventoryStatusClass(
          product.quantity
        ),
      }));

      const categories = await categoryService.getAllCategories();

      res.render('products/search', {
        title: 'Search Products',
        products: result.items,
        categories,
        filters: { name, categoryId, minPrice, maxPrice },
        pagination: {
          current: result.page,
          total: result.pages,
          pages: Array.from({ length: result.pages }, (_, i) => i + 1),
          hasNext: result.page < result.pages,
          hasPrev: result.page > 1,
        },
        scannedCount: result.scannedCount,
        user: req.session.user,
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * Show add product form (admin only)
   */
  async showAddForm(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.render('products/add', {
        title: 'Add Product',
        categories,
        user: req.session.user,
      });
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * Create product (admin only)
   */
  async createProduct(req, res) {
    try {
      const { name, price, quantity, categoryId } = req.body;
      let url_image = '';

      // Handle file upload if provided
      if (req.file) {
        url_image = await s3Service.uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
      }

      const product = await productService.createProduct(
        {
          name,
          price,
          quantity,
          categoryId,
          url_image,
        },
        req.session.user.userId
      );

      res.redirect(`/products/${product.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      const categories = await categoryService.getAllCategories();
      res.status(400).render('products/add', {
        title: 'Add Product',
        categories,
        error: error.message,
        user: req.session.user,
      });
    }
  }

  /**
   * Show product details
   */
  async getProductDetail(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      const category = await categoryService.getCategoryById(product.categoryId);
      const logs = await productService.getProductLogs(req.params.id);

      product.inventoryStatus = productService.getInventoryStatus(product.quantity);
      product.inventoryStatusClass = productService.getInventoryStatusClass(
        product.quantity
      );

      res.render('products/detail', {
        title: product.name,
        product,
        category,
        logs,
        user: req.session.user,
      });
    } catch (error) {
      res.status(404).render('error', { error: error.message });
    }
  }

  /**
   * Show edit form (admin only)
   */
  async showEditForm(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      const categories = await categoryService.getAllCategories();

      res.render('products/edit', {
        title: `Edit - ${product.name}`,
        product,
        categories,
        user: req.session.user,
      });
    } catch (error) {
      res.status(404).render('error', { error: error.message });
    }
  }

  /**
   * Update product (admin only)
   */
  async updateProduct(req, res) {
    try {
      const { name, price, quantity, categoryId } = req.body;
      const productId = req.params.id;

      const product = await productService.getProductById(productId);
      let url_image = product.url_image;

      // Handle file upload if provided
      if (req.file) {
        // Delete old image
        if (product.url_image) {
          await s3Service.deleteImage(product.url_image);
        }

        url_image = await s3Service.uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
      }

      await productService.updateProduct(
        productId,
        {
          name,
          price,
          quantity,
          categoryId,
          url_image,
        },
        req.session.user.userId
      );

      res.redirect(`/products/${productId}`);
    } catch (error) {
      console.error('Error updating product:', error);
      const categories = await categoryService.getAllCategories();
      const product = await productService.getProductById(req.params.id);

      res.status(400).render('products/edit', {
        title: `Edit - ${product.name}`,
        product,
        categories,
        error: error.message,
        user: req.session.user,
      });
    }
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id, req.session.user.userId);
      res.redirect('/products');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProductController();
