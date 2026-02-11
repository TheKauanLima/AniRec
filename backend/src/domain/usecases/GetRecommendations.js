class GetRecommendations
{
  constructor(animeRepository, userRepository, recommendationEngine)
  {
    this.animeRepository = animeRepository;
    this.userRepository = userRepository;
    this.recommendationEngine = recommendationEngine;
  }

  async execute(userId, filters = {})
  {
    // Get user's watch history and ratings
    const userRatings = await this.userRepository.getUserRatings(userId);
    const watchHistory = await this.userRepository.getWatchHistory(userId);

    // Get recommendations based on user preferences
    const recommendations = await this.recommendationEngine.generateRecommendations(
      userId,
      userRatings,
      watchHistory,
      filters
    );

    // Fetch full anime details for recommendations
    const animeList = await Promise.all(
      recommendations.map(rec => this.animeRepository.getAnimeById(rec.animeId))
    );

    return animeList.filter(anime => anime !== null);
  }
}

module.exports = GetRecommendations;
