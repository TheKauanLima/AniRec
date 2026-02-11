class Recommendation {
  constructor({ userId, animeId, score, reason, createdAt }) {
    this.userId = userId;
    this.animeId = animeId;
    this.score = score;
    this.reason = reason;
    this.createdAt = createdAt;
  }

  isHighConfidence() {
    return this.score >= 0.8;
  }
}

module.exports = Recommendation;
