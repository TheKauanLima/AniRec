import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import AnimeCard from '../anime/components/AnimeCard';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchRecommendations();
  }, [navigate]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/recommendations');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="container">
        <h1>Your Personalized Recommendations</h1>
        <p>Based on your watch history and ratings</p>

        {loading ? (
          <p>Loading recommendations...</p>
        ) : (
          <div className="anime-grid">
            {recommendations.map((anime) => (
              <AnimeCard key={anime.malId} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
