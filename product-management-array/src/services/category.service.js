/**
 * Category Service
 * ================
 * Business logic for category operations
 */

const { v4: uuidv4 } = require('uuid');
const categoryRepository = require('../repositories/category.repository');
const productRepository = require('../repositories/product.repository');

class CategoryService {
  /**
   * Create category
   */
  async createCategory(name, description) {
    if (!name) {
      throw new Error('Category name is required');
    }

    const category = {
      categoryId: uuidv4(),
      name,
      description: description || '',
    };

    return categoryRepository.create(category);
  }

  /**
   * Get all categories
   */
  async getAllCategories() {
    return categoryRepository.getAll();
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, name, description) {
    await this.getCategoryById(categoryId); // Check if exists

    return categoryRepository.update(categoryId, {
      name,
      description,
    });
  }

  /**
   * Delete category
   * Business rule: Don't delete products when deleting category
   */
  async deleteCategory(categoryId) {
    await this.getCategoryById(categoryId); // Check if exists

    // Products will keep the categoryId reference (orphaned products)
    // This is a business decision - you could also update products to have null categoryId
    return categoryRepository.delete(categoryId);
  }

  /**
   * Get products in category
   */
  async getProductsByCategory(categoryId) {
    await this.getCategoryById(categoryId);
    return productRepository.getByCategory(categoryId);
  }
}

module.exports = new CategoryService();
