const pool = require('../../config/database');
const AddToWatchlist = require('../../domain/usecases/AddToWatchlist');
const RateAnime = require('../../domain/usecases/RateAnime');
const AnimeRepository = require('../../infrastructure/database/repositories/AnimeRepository');
const UserRepository = require('../../infrastructure/database/repositories/UserRepository');
const MALClient = require('../../infrastructure/api/MALClient');

class UserController {
  constructor() {
    this.animeRepository = new AnimeRepository();
    this.userRepository = new UserRepository();
    this.malClient = new MALClient();
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return res.status(404).json(
          {
            error: 'User not found'
          });
      }

      let profilePicture = null;
      let accessToken = user.malAccessToken;

      // If MAL is connected, refresh expired token before requesting profile.
      if (user.malId && accessToken) {
        if (user.malTokenExpires && new Date(user.malTokenExpires) < new Date() && user.malRefreshToken) {
          try {
            const refreshed = await this.malClient.refreshAccessToken(user.malRefreshToken);
            accessToken = refreshed.accessToken;

            await this.userRepository.updateMalTokens(userId,
              {
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
                tokenExpires: new Date(Date.now() + refreshed.expiresIn * 1000),
              });
          }
          catch (refreshError) {
            console.warn('Unable to refresh MAL token for profile fetch:', refreshError.message);
          }
        }

        if (accessToken) {
          try {
            const malProfile = await this.malClient.getUserProfile(accessToken);
            profilePicture = malProfile.picture || null;
          }
          catch (malError) {
            console.warn('Unable to fetch MAL profile picture:', malError.message);
          }
        }
      }

      res.json(
        {
          user:
          {
            id: user.id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            malUsername: user.malUsername,
            malConnected: !!user.malId,
            profilePicture,
          }
        });
    }
    catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json(
        {
          error: 'Failed to fetch profile'
        });
    }
  }

  async getWatchlist(req, res) {
    try {
      const userId = req.user.userId;

      const result = await pool.query(
        'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC',
        [userId]
      );

      res.json(
        {
          watchlist: result.rows
        });
    }
    catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json(
        {
          error: 'Failed to fetch watchlist'
        });
    }
  }

  async addToWatchlist(req, res) {
    try {
      const userId = req.user.userId;
      const
        {
          animeId,
          status = 'plan_to_watch'
        } = req.body;

      if (!animeId) {
        return res.status(400).json(
          {
            error: 'Anime ID is required'
          });
      }

      const result = await pool.query(
        `INSERT INTO watchlist (user_id, anime_id, status, added_at) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (user_id, anime_id) DO UPDATE SET status = $3
         RETURNING *`,
        [userId, animeId, status, new Date()]
      );

      res.status(201).json(
        {
          message: 'Added to watchlist',
          item: result.rows[0]
        });
    }
    catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(500).json(
        {
          error: 'Failed to add to watchlist'
        });
    }
  }

  async removeFromWatchlist(req, res) {
    try {
      const userId = req.user.userId;
      const
        {
          animeId
        } = req.params;

      await pool.query(
        'DELETE FROM watchlist WHERE user_id = $1 AND anime_id = $2',
        [userId, animeId]
      );

      res.json(
        {
          message: 'Removed from watchlist'
        });
    }
    catch (error) {
      console.error('Error removing from watchlist:', error);
      res.status(500).json(
        {
          error: 'Failed to remove from watchlist'
        });
    }
  }

  async rateAnime(req, res) {
    try {
      const userId = req.user.userId;
      const
        {
          animeId,
          rating,
          review
        } = req.body;

      if (!animeId || !rating) {
        return res.status(400).json(
          {
            error: 'Anime ID and rating are required'
          });
      }

      if (rating < 1 || rating > 10) {
        return res.status(400).json(
          {
            error: 'Rating must be between 1 and 10'
          });
      }

      const result = await pool.query(
        `INSERT INTO ratings (user_id, anime_id, rating, review, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (user_id, anime_id) DO UPDATE 
         SET rating = $3, review = $4
         RETURNING *`,
        [userId, animeId, rating, review, new Date()]
      );

      res.status(201).json(
        {
          message: 'Rating saved',
          rating: result.rows[0]
        });
    }
    catch (error) {
      console.error('Error saving rating:', error);
      res.status(500).json(
        {
          error: 'Failed to save rating'
        });
    }
  }

  async getRatings(req, res) {
    try {
      const userId = req.user.userId;

      const result = await pool.query(
        'SELECT * FROM ratings WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json(
        {
          ratings: result.rows
        });
    }
    catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json(
        {
          error: 'Failed to fetch ratings'
        });
    }
  }
}

module.exports = UserController;
