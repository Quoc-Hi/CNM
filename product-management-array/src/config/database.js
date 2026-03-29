/**
 * Database Schema & Initialization
 * ================================
 * 
 * This file defines the DynamoDB tables structure and provides
 * initialization functions to create tables in DynamoDB.
 */

const { CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { dynamoDBClient } = require('./aws');

const TABLES = {
  USERS: 'Users',
  CATEGORIES: 'Categories',
  PRODUCTS: 'Products',
  PRODUCT_LOGS: 'ProductLogs',
};

/**
 * Schema Definitions
 * ==================
 */

const tableSchemas = {
  // Users Table
  [TABLES.USERS]: {
    TableName: TABLES.USERS,
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },

  // Categories Table
  [TABLES.CATEGORIES]: {
    TableName: TABLES.CATEGORIES,
    KeySchema: [{ AttributeName: 'categoryId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'categoryId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },

  // Products Table
  [TABLES.PRODUCTS]: {
    TableName: TABLES.PRODUCTS,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'categoryId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'categoryId-createdAt-index',
        KeySchema: [
          { AttributeName: 'categoryId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },

  // ProductLogs Table
  [TABLES.PRODUCT_LOGS]: {
    TableName: TABLES.PRODUCT_LOGS,
    KeySchema: [
      { AttributeName: 'productId', KeyType: 'HASH' },
      { AttributeName: 'time', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'productId', AttributeType: 'S' },
      { AttributeName: 'time', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
};

/**
 * Initialize Tables
 * Only creates tables if they don't exist
 */
async function initializeTables() {
  console.log('🔄 Checking DynamoDB tables...');

  try {
    // List existing tables
    const listTablesCommand = new ListTablesCommand({});
    const existingTables = await dynamoDBClient.send(listTablesCommand);
    const tableNames = existingTables.TableNames || [];

    // Create missing tables
    for (const [key, schema] of Object.entries(tableSchemas)) {
      if (!tableNames.includes(schema.TableName)) {
        console.log(`📝 Creating table: ${schema.TableName}`);
        await dynamoDBClient.send(new CreateTableCommand(schema));
        // Wait a bit for table creation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log(`✅ Table ${schema.TableName} already exists`);
      }
    }

    console.log('✨ All tables ready!');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    // Don't exit, allow app to run (tables may already exist in production)
  }
}

module.exports = {
  TABLES,
  tableSchemas,
  initializeTables,
};
