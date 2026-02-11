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
      `INSERT INTO users (username, email, password_hash, created_at) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userData.username, userData.email, userData.passwordHash, new Date()]
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
}

module.exports = UserRepository;
