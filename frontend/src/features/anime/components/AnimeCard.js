import React from 'react';
import { Link } from 'react-router-dom';
import './AnimeCard.css';

const AnimeCard = ({ anime }) => {
  return (
    <Link to={`/anime/${anime.malId}`} className="anime-card">
      <div className="anime-card-image">
        <img src={anime.imageUrl} alt={anime.title} />
      </div>
      <div className="anime-card-content">
        <h3>{anime.title}</h3>
        <div className="anime-card-info">
          <span className="score">⭐ {anime.score || 'N/A'}</span>
          <span className="episodes">{anime.episodes || '?'} eps</span>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
