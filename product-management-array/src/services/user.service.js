/**
 * User Service
 * ============
 * Business logic for user operations
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/user.repository');

class UserService {
  /**
   * Hash password
   */
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register new user
   */
  async register(username, password, role = 'staff') {
    // Check if user exists
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = {
      userId: uuidv4(),
      username,
      password: hashedPassword,
      role,
    };

    return userRepository.create(user);
  }

  /**
   * Login user
   */
  async login(username, password) {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      throw new Error('Username or password incorrect');
    }

    const isPasswordCorrect = await this.comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error('Username or password incorrect');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Don't return password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Create user (admin only)
   */
  async createUser(username, password, role) {
    return this.register(username, password, role);
  }
}

module.exports = new UserService();
