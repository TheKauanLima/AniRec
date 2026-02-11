const pool = require('../../../config/database');
const User = require('../../../domain/entities/User');

class UserRepository {
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    return new User(result.rows[0]);
  }

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) return null;
    
    return new User(result.rows[0]);
  }

  async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) return null;
    
    return new User(result.rows[0]);
  }

  async create(userData) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_verified, verification_token, verification_token_expires, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        userData.username, 
        userData.email, 
        userData.passwordHash, 
        userData.isVerified || false,
        userData.verificationToken || null,
        userData.verificationTokenExpires || null,
        new Date()
      ]
    );
    
    return new User(result.rows[0]);
  }

  async getUserRatings(userId) {
    const result = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result.rows;
  }

  async getWatchHistory(userId) {
    const result = await pool.query(
      'SELECT * FROM watchlist WHERE user_id = $1',
      [userId]
    );
    
    return result.rows;
  }
  
  async findByVerificationToken(token) {
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );
    
    if (result.rows.length === 0) return null;
    
    return new User(result.rows[0]);
  }

  async verifyUser(userId) {
    const result = await pool.query(
      `UPDATE users 
       SET is_verified = true, 
           verification_token = NULL, 
           verification_token_expires = NULL 
       WHERE id = $1 
       RETURNING *`,
      [userId]
    );
    
    return result.rows[0];
  }

  async updateVerificationToken(userId, token, expires) {
    const result = await pool.query(
      `UPDATE users 
       SET verification_token = $1, 
           verification_token_expires = $2 
       WHERE id = $3 
       RETURNING *`,
      [token, expires, userId]
    );
    
    return result.rows[0];
  }
}

module.exports = UserRepository;
