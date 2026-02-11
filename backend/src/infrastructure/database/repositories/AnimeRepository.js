const JikanClient = require('../../api/JikanClient');
const Anime = require('../../../domain/entities/Anime');

class AnimeRepository {
  async getAnimeById(malId) {
    try {
      const animeData = await JikanClient.getAnimeById(malId);
      
      return new Anime({
        malId: animeData.mal_id,
        title: animeData.title,
        titleEnglish: animeData.title_english,
        synopsis: animeData.synopsis,
        genres: animeData.genres,
        score: animeData.score,
        episodes: animeData.episodes,
        status: animeData.status,
        imageUrl: animeData.images?.jpg?.large_image_url,
        year: animeData.year,
      });
    } catch (error) {
      console.error(`Error fetching anime ${malId}:`, error.message);
      return null;
    }
  }

  async searchAnime(query, page = 1) {
    try {
      const results = await JikanClient.searchAnime(query, page);
      
      return results.data.map(animeData => new Anime({
        malId: animeData.mal_id,
        title: animeData.title,
        titleEnglish: animeData.title_english,
        synopsis: animeData.synopsis,
        genres: animeData.genres,
        score: animeData.score,
        episodes: animeData.episodes,
        status: animeData.status,
        imageUrl: animeData.images?.jpg?.large_image_url,
        year: animeData.year,
      }));
    } catch (error) {
      console.error('Error searching anime:', error.message);
      return [];
    }
  }

  async getTopAnime(page = 1) {
    try {
      const results = await JikanClient.getTopAnime(page);
      
      return results.data.map(animeData => new Anime({
        malId: animeData.mal_id,
        title: animeData.title,
        titleEnglish: animeData.title_english,
        synopsis: animeData.synopsis,
        genres: animeData.genres,
        score: animeData.score,
        episodes: animeData.episodes,
        status: animeData.status,
        imageUrl: animeData.images?.jpg?.large_image_url,
        year: animeData.year,
      }));
    } catch (error) {
      console.error('Error fetching top anime:', error.message);
      return [];
    }
  }
}

module.exports = AnimeRepository;
