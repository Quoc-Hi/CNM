/**
 * Product Log Repository
 * ======================
 * Handles audit logging for all product operations
 */

const { docClient } = require('../config/aws');
const { TABLES } = require('../config/database');
const { PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

class ProductLogRepository {
  /**
   * Create audit log entry
   * @param {Object} log - { logId, productId, action, userId, time, details }
   * @returns {Promise<Object>}
   */
  async create(log) {
    const params = {
      TableName: TABLES.PRODUCT_LOGS,
      Item: {
        ...log,
        time: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return log;
  }

  /**
   * Get logs for a product
   * @param {String} productId
   * @returns {Promise<Array>}
   */
  async getByProductId(productId) {
    const params = {
      TableName: TABLES.PRODUCT_LOGS,
      KeyConditionExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId,
      },
      ScanIndexForward: false, // Sort by time descending
    };

    const { Items } = await docClient.send(new QueryCommand(params));
    return Items || [];
  }

  /**
   * Get all logs with pagination
   * @param {Number} page
   * @param {Number} limit
   * @returns {Promise<{items: Array, total: Number}>}
   */
  async getAll(page = 1, limit = 50) {
    const params = {
      TableName: TABLES.PRODUCT_LOGS,
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    const logs = (Items || []).sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );

    const total = logs.length;
    const pages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const items = logs.slice(startIdx, startIdx + limit);

    return {
      items,
      total,
      page,
      pages,
    };
  }

  /**
   * Get logs filtered by action type
   * @param {String} action - CREATE, UPDATE, DELETE
   * @returns {Promise<Array>}
   */
  async getByAction(action) {
    const params = {
      TableName: TABLES.PRODUCT_LOGS,
      FilterExpression: '#action = :action',
      ExpressionAttributeNames: { '#action': 'action' },
      ExpressionAttributeValues: {
        ':action': action,
      },
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return (Items || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  }
}

module.exports = new ProductLogRepository();
