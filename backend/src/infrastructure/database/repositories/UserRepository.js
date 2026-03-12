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

  // --- MAL OAuth methods ---

  async findByMalId(malId) {
    const result = await pool.query(
      'SELECT * FROM users WHERE mal_id = $1',
      [malId]
    );

    if (result.rows.length === 0) return null;

    return new User(result.rows[0]);
  }

  async createFromMal(malData) {
    // Ensure unique username — append MAL ID if username is taken
    let username = malData.username;
    const existing = await this.findByUsername(username);
    if (existing) {
      username = `${username}_mal${malData.malId}`;
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_verified, mal_id, mal_username, mal_access_token, mal_refresh_token, mal_token_expires, created_at)
       VALUES ($1, NULL, NULL, true, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        username,
        malData.malId,
        malData.malUsername,
        malData.accessToken,
        malData.refreshToken,
        malData.tokenExpires,
        new Date(),
      ]
    );

    return new User(result.rows[0]);
  }

  async linkMalAccount(userId, malData) {
    const result = await pool.query(
      `UPDATE users
       SET mal_id = $1,
           mal_username = $2,
           mal_access_token = $3,
           mal_refresh_token = $4,
           mal_token_expires = $5
       WHERE id = $6
       RETURNING *`,
      [
        malData.malId,
        malData.malUsername,
        malData.accessToken,
        malData.refreshToken,
        malData.tokenExpires,
        userId,
      ]
    );

    return new User(result.rows[0]);
  }

  async updateMalTokens(userId, tokenData) {
    const result = await pool.query(
      `UPDATE users
       SET mal_access_token = $1,
           mal_refresh_token = $2,
           mal_token_expires = $3
       WHERE id = $4
       RETURNING *`,
      [
        tokenData.accessToken,
        tokenData.refreshToken,
        tokenData.tokenExpires,
        userId,
      ]
    );

    return new User(result.rows[0]);
  }

  async upsertRating(userId, animeId, rating, review) {
    const result = await pool.query(
      `INSERT INTO ratings (user_id, anime_id, rating, review, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, anime_id)
       DO UPDATE SET rating = $3, review = $4
       RETURNING *`,
      [userId, animeId, rating, review]
    );

    return result.rows[0];
  }

  async upsertWatchlistItem(userId, animeId, status) {
    const result = await pool.query(
      `INSERT INTO watchlist (user_id, anime_id, status, added_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, anime_id)
       DO UPDATE SET status = $3
       RETURNING *`,
      [userId, animeId, status]
    );

    return result.rows[0];
  }
}

module.exports = UserRepository;
