class Anime {
  constructor({ 
    malId, 
    title, 
    titleEnglish, 
    synopsis, 
    genres, 
    score, 
    episodes, 
    status,
    imageUrl,
    year
  }) {
    this.malId = malId;
    this.title = title;
    this.titleEnglish = titleEnglish;
    this.synopsis = synopsis;
    this.genres = genres || [];
    this.score = score;
    this.episodes = episodes;
    this.status = status;
    this.imageUrl = imageUrl;
    this.year = year;
  }

  isHighlyRated() {
    return this.score >= 8.0;
  }

  hasGenre(genreName) {
    return this.genres.some(genre => 
      genre.name.toLowerCase() === genreName.toLowerCase()
    );
  }
}

module.exports = Anime;
