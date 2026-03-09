/**
 * User Repository
 * ===============
 * Handles all database operations for Users table
 */

const { docClient } = require('../config/aws');
const {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { TABLES } = require('../config/database');

class UserRepository {
  /**
   * Create a new user
   * @param {Object} user - User data: { userId, username, password, role, createdAt }
   * @returns {Promise<Object>} Created user
   */
  async create(user) {
    const params = {
      TableName: TABLES.USERS,
      Item: {
        ...user,
        createdAt: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return user;
  }

  /**
   * Find user by ID
   * @param {String} userId
   * @returns {Promise<Object|null>}
   */
  async findById(userId) {
    const params = {
      TableName: TABLES.USERS,
      Key: { userId },
    };

    const { Item } = await docClient.send(new GetCommand(params));
    return Item || null;
  }

  /**
   * Find user by username (requires scan since username is not a key)
   * NOTE: In production, consider adding a GSI on username for better performance
   * @param {String} username
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    const params = {
      TableName: TABLES.USERS,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return Items && Items.length > 0 ? Items[0] : null;
  }

  /**
   * Update user
   * @param {String} userId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async update(userId, updates) {
    const params = {
      TableName: TABLES.USERS,
      Key: { userId },
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
   * Get all users (for admin purposes)
   * @returns {Promise<Array>}
   */
  async getAll() {
    const params = {
      TableName: TABLES.USERS,
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return Items || [];
  }

  /**
   * Delete user
   * @param {String} userId
   * @returns {Promise<void>}
   */
  async delete(userId) {
    const params = {
      TableName: TABLES.USERS,
      Key: { userId },
    };

    await docClient.send(new DeleteCommand(params));
  }
}

module.exports = new UserRepository();
