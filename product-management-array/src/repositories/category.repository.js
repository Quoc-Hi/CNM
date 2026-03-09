/**
 * Category Repository
 * ===================
 * Handles all database operations for Categories table
 */

const { docClient } = require('../config/aws');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { TABLES } = require('../config/database');

class CategoryRepository {
  /**
   * Create a new category
   * @param {Object} category - { categoryId, name, description }
   * @returns {Promise<Object>}
   */
  async create(category) {
    const params = {
      TableName: TABLES.CATEGORIES,
      Item: {
        ...category,
        createdAt: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return category;
  }

  /**
   * Find category by ID
   * @param {String} categoryId
   * @returns {Promise<Object|null>}
   */
  async findById(categoryId) {
    const params = {
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
    };

    const { Item } = await docClient.send(new GetCommand(params));
    return Item || null;
  }

  /**
   * Get all categories
   * @returns {Promise<Array>}
   */
  async getAll() {
    const params = {
      TableName: TABLES.CATEGORIES,
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return (Items || []).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Update category
   * @param {String} categoryId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async update(categoryId, updates) {
    const params = {
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
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
   * Delete category (soft delete - just mark as deleted)
   * Note: Products are NOT deleted when category is deleted (business rule)
   * @param {String} categoryId
   * @returns {Promise<void>}
   */
  async delete(categoryId) {
    const params = {
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
    };

    await docClient.send(new DeleteCommand(params));
  }
}

module.exports = new CategoryRepository();
