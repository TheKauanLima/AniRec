const axios = require('axios');
const redisClient = require('../../config/redis');

class JikanClient {
  constructor() {
    this.baseURL = 'https://api.jikan.moe/v4';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
    this.cacheTTL = 3600; // 1 hour
  }

  async getAnimeById(malId) {
    const cacheKey = `anime:${malId}`;
    
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from API
    try {
      const response = await this.client.get(`/anime/${malId}`);
      const anime = response.data.data;

      // Cache the result
      await redisClient.setEx(cacheKey, this.cacheTTL, JSON.stringify(anime));

      return anime;
    } catch (error) {
      console.error(`Error fetching anime ${malId}:`, error.message);
      throw error;
    }
  }

  async searchAnime(query, page = 1, limit = 25) {
    const cacheKey = `search:${query}:${page}:${limit}`;
    
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.get('/anime', {
        params: { q: query, page, limit },
      });
      const results = response.data;

      await redisClient.setEx(cacheKey, this.cacheTTL, JSON.stringify(results));

      return results;
    } catch (error) {
      console.error('Error searching anime:', error.message);
      throw error;
    }
  }

  async getTopAnime(page = 1, limit = 25) {
    const cacheKey = `top:${page}:${limit}`;
    
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.get('/top/anime', {
        params: { page, limit },
      });
      const results = response.data;

      await redisClient.setEx(cacheKey, this.cacheTTL * 2, JSON.stringify(results));

      return results;
    } catch (error) {
      console.error('Error fetching top anime:', error.message);
      throw error;
    }
  }

  async getAnimeRecommendations(malId) {
    try {
      const response = await this.client.get(`/anime/${malId}/recommendations`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching recommendations for ${malId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new JikanClient();
