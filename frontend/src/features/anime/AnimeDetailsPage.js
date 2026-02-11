import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import './AnimeDetailsPage.css';

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimeDetails();
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/anime/${id}`);
      setAnime(response.data);
    } catch (error) {
      console.error('Error fetching anime details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      await apiClient.post('/users/watchlist', { animeId: id });
      alert('Added to watchlist!');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!anime) return <div className="container">Anime not found</div>;

  return (
    <div className="anime-details">
      <div className="anime-details-container">
        <div className="anime-details-image">
          <img src={anime.imageUrl} alt={anime.title} />
        </div>
        <div className="anime-details-content">
          <h1>{anime.title}</h1>
          {anime.titleEnglish && <h2>{anime.titleEnglish}</h2>}
          
          <div className="anime-meta">
            <span className="score">⭐ {anime.score}</span>
            <span>{anime.episodes} episodes</span>
            <span>{anime.status}</span>
          </div>

          <div className="anime-genres">
            {anime.genres?.map((genre) => (
              <span key={genre.mal_id} className="genre-tag">
                {genre.name}
              </span>
            ))}
          </div>

          <p className="synopsis">{anime.synopsis}</p>

          <button onClick={handleAddToWatchlist} className="btn-add-watchlist">
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
