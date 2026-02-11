class AddToWatchlist
{
  constructor(watchlistRepository, animeRepository)
  {
    this.watchlistRepository = watchlistRepository;
    this.animeRepository = animeRepository;
  }

  async execute(userId, animeId)
  {
    // Check if anime exists
    const anime = await this.animeRepository.getAnimeById(animeId);
    if (!anime)
    {
      throw new Error('Anime not found');
    }

    // Check if already in watchlist
    const exists = await this.watchlistRepository.exists(userId, animeId);
    if (exists)
    {
      throw new Error('Anime already in watchlist');
    }

    // Add to watchlist
    const watchlistItem = await this.watchlistRepository.add(
    {
      userId,
      animeId,
      addedAt: new Date(),
      status: 'plan_to_watch',
    });

    return watchlistItem;
  }
}

module.exports = AddToWatchlist;
