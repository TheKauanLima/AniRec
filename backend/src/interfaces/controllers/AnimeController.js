const AnimeRepository = require('../../infrastructure/database/repositories/AnimeRepository');

class AnimeController {
  constructor() {
    this.animeRepository = new AnimeRepository();
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const anime = await this.animeRepository.getAnimeById(id);

      if (!anime) {
        return res.status(404).json({ error: 'Anime not found' });
      }

      res.json(anime);
    } catch (error) {
      console.error('Error fetching anime:', error);
      res.status(500).json({ error: 'Failed to fetch anime' });
    }
  }

  async search(req, res) {
    try {
      const { q, page = 1 } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const results = await this.animeRepository.searchAnime(q, parseInt(page));
      res.json({ results, page: parseInt(page) });
    } catch (error) {
      console.error('Error searching anime:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  async getTop(req, res) {
    try {
      const { page = 1 } = req.query;
      const results = await this.animeRepository.getTopAnime(parseInt(page));
      res.json({ results, page: parseInt(page) });
    } catch (error) {
      console.error('Error fetching top anime:', error);
      res.status(500).json({ error: 'Failed to fetch top anime' });
    }
  }
}

module.exports = AnimeController;
