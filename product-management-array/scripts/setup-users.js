/**
 * Database Initialization Script
 * ==============================
 * This script creates default test users in DynamoDB
 * Run this after starting the application
 */

require('dotenv').config();
const userService = require('./src/services/user.service');
const { docClient } = require('./src/config/aws');
const { TABLES } = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function createTestUsers() {
  console.log('🔄 Creating test users in DynamoDB...\n');

  const testUsers = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
    },
    {
      username: 'staff',
      password: 'staff123',
      role: 'staff',
    },
  ];

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await require('./src/repositories/user.repository').findByUsername(user.username);

      if (existingUser) {
        console.log(`✅ User '${user.username}' already exists (${user.role})`);
      } else {
        // Create new user
        const hashedPassword = await userService.hashPassword(user.password);
        const newUser = {
          userId: uuidv4(),
          username: user.username,
          password: hashedPassword,
          role: user.role,
          createdAt: new Date().toISOString(),
        };

        const params = {
          TableName: TABLES.USERS,
          Item: newUser,
        };

        await docClient.put(params);
        console.log(`✅ Created user '${user.username}' (${user.role})`);
        console.log(`   Password: ${user.password}\n`);
      }
    } catch (error) {
      console.error(`❌ Error creating user '${user.username}':`, error.message);
    }
  }

  console.log('\n✨ Test users setup complete!\n');
  console.log('You can now login with:');
  console.log('  Admin:  admin / admin123');
  console.log('  Staff:  staff / staff123\n');

  process.exit(0);
}

createTestUsers().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
