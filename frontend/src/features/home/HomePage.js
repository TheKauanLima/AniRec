import React, { useState, useEffect } from 'react';
import apiClient from '../../shared/api/apiClient';
import AnimeCard from '../anime/components/AnimeCard';
import './HomePage.css';

const HomePage = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopAnime();
  }, []);

  const fetchTopAnime = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/anime/top');
      setTopAnime(response.data.results);
    } catch (error) {
      console.error('Error fetching top anime:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Discover Your Next Favorite Anime</h1>
        <p>Get personalized recommendations based on your preferences</p>
      </div>

      <div className="container">
        <h2>Top Rated Anime</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="anime-grid">
            {topAnime.map((anime) => (
              <AnimeCard key={anime.malId} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
