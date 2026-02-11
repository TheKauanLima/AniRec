class RateAnime
{
  constructor(ratingRepository, animeRepository)
  {
    this.ratingRepository = ratingRepository;
    this.animeRepository = animeRepository;
  }

  async execute(userId, animeId, rating, review = null)
  {
    // Validate rating
    if (rating < 1 || rating > 10)
    {
      throw new Error('Rating must be between 1 and 10');
    }

    // Check if anime exists
    const anime = await this.animeRepository.getAnimeById(animeId);
    if (!anime)
    {
      throw new Error('Anime not found');
    }

    // Save or update rating
    const savedRating = await this.ratingRepository.saveRating(
    {
      userId,
      animeId,
      rating,
      review,
      createdAt: new Date(),
    });

    return savedRating;
  }
}

module.exports = RateAnime;
