/**
 * Product Repository
 * ==================
 * Handles all database operations for Products table
 * Supports filtering, searching, and pagination
 */

const { docClient } = require('../config/aws');
const { TABLES } = require('../config/database');
const {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

class ProductRepository {
  /**
   * Create a new product
   * @param {Object} product - { id, name, price, quantity, categoryId, url_image, createdAt, isDeleted }
   * @returns {Promise<Object>}
   */
  async create(product) {
    const params = {
      TableName: TABLES.PRODUCTS,
      Item: {
        ...product,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return product;
  }

  /**
   * Find product by ID (excludes deleted products)
   * @param {String} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const params = {
      TableName: TABLES.PRODUCTS,
      Key: { id },
    };

    const { Item } = await docClient.send(new GetCommand(params));

    // Return null if product is deleted
    if (Item && Item.isDeleted) {
      return null;
    }

    return Item || null;
  }

  /**
   * Get all products (paginated, excludes deleted)
   * NOTE: Uses Scan - consider using Query with GSI for better performance
   * @param {Number} page - Page number (1-indexed)
   * @param {Number} limit - Items per page
   * @returns {Promise<{items: Array, total: Number, page: Number, pages: Number}>}
   */
  async getAll(page = 1, limit = 10) {
    const params = {
      TableName: TABLES.PRODUCTS,
      FilterExpression: 'isDeleted = :deleted',
      ExpressionAttributeValues: {
        ':deleted': false,
      },
    };

    const { Items, Count, ScannedCount } = await docClient.send(new ScanCommand(params));
    const products = (Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination
    const total = products.length;
    const pages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const items = products.slice(startIdx, startIdx + limit);

    return {
      items,
      total,
      page,
      pages,
      scannedCount: ScannedCount, // For analysis
    };
  }

  /**
   * Search products by name and/or filter by category and price range
   * NOTE: This uses Scan which is not optimal for large datasets
   * For production: implement GSIs or use ElasticSearch
   * @param {Object} filters - { name, categoryId, minPrice, maxPrice, page, limit }
   * @returns {Promise<{items: Array, total: Number, page: Number, pages: Number}>}
   */
  async search(filters = {}) {
    const { name, categoryId, minPrice, maxPrice, page = 1, limit = 10 } = filters;

    // Build filter expression dynamically
    const filterExpressions = ['isDeleted = :deleted'];
    const expressionValues = { ':deleted': false };

    let filterIndex = 0;

    if (name) {
      filterExpressions.push(`contains(#name, :name)`);
      expressionValues[':name'] = name;
    }

    if (categoryId) {
      filterExpressions.push(`categoryId = :categoryId`);
      expressionValues[':categoryId'] = categoryId;
    }

    if (minPrice !== undefined) {
      filterExpressions.push(`price >= :minPrice`);
      expressionValues[':minPrice'] = parseFloat(minPrice);
    }

    if (maxPrice !== undefined) {
      filterExpressions.push(`price <= :maxPrice`);
      expressionValues[':maxPrice'] = parseFloat(maxPrice);
    }

    const params = {
      TableName: TABLES.PRODUCTS,
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeValues: expressionValues,
    };

    if (name) {
      params.ExpressionAttributeNames = { '#name': 'name' };
    }

    const { Items, ScannedCount } = await docClient.send(new ScanCommand(params));

    const products = (Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination
    const total = products.length;
    const pages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const items = products.slice(startIdx, startIdx + limit);

    return {
      items,
      total,
      page,
      pages,
      scannedCount: ScannedCount, // Important: Shows how many items were scanned (cost indicator)
    };
  }

  /**
   * Update product
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    const params = {
      TableName: TABLES.PRODUCTS,
      Key: { id },
      UpdateExpression:
        'SET ' + Object.keys(updates).map((key) => `${key} = :${key}`).join(', '),
      ExpressionAttributeValues: Object.entries(updates).reduce(
        (acc, [key, value]) => {
          acc[`:${key}`] = value;
          return acc;
        },
        {}
      ),
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return Attributes;
  }

  /**
   * Soft delete product (set isDeleted = true)
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async softDelete(id) {
    return this.update(id, { isDeleted: true });
  }

  /**
   * Hard delete product (permanent deletion)
   * Only use if absolutely necessary
   * @param {String} id
   * @returns {Promise<void>}
   */
  async hardDelete(id) {
    const params = {
      TableName: TABLES.PRODUCTS,
      Key: { id },
    };

    await docClient.send(new DeleteCommand(params));
  }

  /**
   * Get products by category (using optional GSI)
   * @param {String} categoryId
   * @returns {Promise<Array>}
   */
  async getByCategory(categoryId) {
    const params = {
      TableName: TABLES.PRODUCTS,
      FilterExpression: 'categoryId = :categoryId AND isDeleted = :deleted',
      ExpressionAttributeValues: {
        ':categoryId': categoryId,
        ':deleted': false,
      },
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return (Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}

module.exports = new ProductRepository();
