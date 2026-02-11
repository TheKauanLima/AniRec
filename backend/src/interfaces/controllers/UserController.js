const pool = require('../../config/database');
const AddToWatchlist = require('../../domain/usecases/AddToWatchlist');
const RateAnime = require('../../domain/usecases/RateAnime');
const AnimeRepository = require('../../infrastructure/database/repositories/AnimeRepository');

class UserController
{
  constructor()
  {
    this.animeRepository = new AnimeRepository();
  }

  async getWatchlist(req, res)
  {
    try
    {
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
    catch (error)
    {
      console.error('Error fetching watchlist:', error);
      res.status(500).json(
      {
        error: 'Failed to fetch watchlist'
      });
    }
  }

  async addToWatchlist(req, res)
  {
    try
    {
      const userId = req.user.userId;
      const
      {
        animeId,
        status = 'plan_to_watch'
      } = req.body;

      if (!animeId)
      {
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
    catch (error)
    {
      console.error('Error adding to watchlist:', error);
      res.status(500).json(
      {
        error: 'Failed to add to watchlist'
      });
    }
  }

  async removeFromWatchlist(req, res)
  {
    try
    {
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
    catch (error)
    {
      console.error('Error removing from watchlist:', error);
      res.status(500).json(
      {
        error: 'Failed to remove from watchlist'
      });
    }
  }

  async rateAnime(req, res)
  {
    try
    {
      const userId = req.user.userId;
      const
      {
        animeId,
        rating,
        review
      } = req.body;

      if (!animeId || !rating)
      {
        return res.status(400).json(
        {
          error: 'Anime ID and rating are required'
        });
      }

      if (rating < 1 || rating > 10)
      {
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
    catch (error)
    {
      console.error('Error saving rating:', error);
      res.status(500).json(
      {
        error: 'Failed to save rating'
      });
    }
  }

  async getRatings(req, res)
  {
    try
    {
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
    catch (error)
    {
      console.error('Error fetching ratings:', error);
      res.status(500).json(
      {
        error: 'Failed to fetch ratings'
      });
    }
  }
}

module.exports = UserController;
