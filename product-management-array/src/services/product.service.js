/**
 * Product Service
 * ===============
 * Business logic for product operations, including search, filter, and inventory
 */

const { v4: uuidv4 } = require('uuid');
const productRepository = require('../repositories/product.repository');
const productLogRepository = require('../repositories/productlog.repository');
const categoryService = require('./category.service');
const s3Service = require('./s3.service');

class ProductService {
  /**
   * Create product
   */
  async createProduct(productData, userId) {
    const {
      name,
      price,
      quantity,
      categoryId,
      url_image,
    } = productData;

    if (!name || !price || !categoryId) {
      throw new Error('Name, price, and category are required');
    }

    // Verify category exists
    await categoryService.getCategoryById(categoryId);

    const product = {
      id: uuidv4(),
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      categoryId,
      url_image: url_image || '',
      isDeleted: false,
    };

    await productRepository.create(product);

    // Log the action
    await productLogRepository.create({
      logId: uuidv4(),
      productId: product.id,
      action: 'CREATE',
      userId,
      details: `Created product: ${name}`,
    });

    return product;
  }

  /**
   * Get all products with pagination
   */
  async getAllProducts(page = 1, limit = 10) {
    return productRepository.getAll(page, limit);
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  /**
   * Search and filter products
   */
  async searchProducts(filters = {}) {
    return productRepository.search(filters);
  }

  /**
   * Update product
   */
  async updateProduct(id, updates, userId) {
    await this.getProductById(id); // Check if exists

    if (updates.categoryId) {
      await categoryService.getCategoryById(updates.categoryId);
    }

    const updatedProduct = await productRepository.update(id, {
      name: updates.name,
      price: updates.price ? parseFloat(updates.price) : undefined,
      quantity: updates.quantity ? parseInt(updates.quantity) : undefined,
      categoryId: updates.categoryId,
      url_image: updates.url_image,
    });

    // Log the action
    await productLogRepository.create({
      logId: uuidv4(),
      productId: id,
      action: 'UPDATE',
      userId,
      details: `Updated product: ${updates.name || updatedProduct.name}`,
    });

    return updatedProduct;
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id, userId) {
    const product = await this.getProductById(id);

    // Delete image from S3 if exists
    if (product.url_image) {
      try {
        await s3Service.deleteImage(product.url_image);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
        // Continue with soft delete even if S3 fails
      }
    }

    await productRepository.softDelete(id);

    // Log the action
    await productLogRepository.create({
      logId: uuidv4(),
      productId: id,
      action: 'DELETE',
      userId,
      details: `Deleted product: ${product.name}`,
    });

    return { message: 'Product deleted successfully' };
  }

  /**
   * Get inventory status for product
   * Returns: "In Stock", "Low Stock", or "Out of Stock"
   */
  getInventoryStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 5) return 'Low Stock';
    return 'In Stock';
  }

  /**
   * Get inventory status class for UI (Bootstrap colors)
   */
  getInventoryStatusClass(quantity) {
    if (quantity === 0) return 'danger';
    if (quantity < 5) return 'warning';
    return 'success';
  }

  /**
   * Get product logs
   */
  async getProductLogs(productId) {
    return productLogRepository.getByProductId(productId);
  }

  /**
   * Get all logs with pagination
   */
  async getAllLogs(page = 1, limit = 50) {
    return productLogRepository.getAll(page, limit);
  }
}

module.exports = new ProductService();
