import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import './ProfilePage.css';

const ProfilePage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [watchlistRes, ratingsRes] = await Promise.all([
        apiClient.get('/users/watchlist'),
        apiClient.get('/users/ratings'),
      ]);
      setWatchlist(watchlistRes.data.watchlist);
      setRatings(ratingsRes.data.ratings);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <section className="profile-section">
          <h2>My Watchlist ({watchlist.length})</h2>
          <div className="watchlist-items">
            {watchlist.map((item) => (
              <div key={item.id} className="watchlist-item">
                <p>Anime ID: {item.anime_id}</p>
                <p>Status: {item.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2>My Ratings ({ratings.length})</h2>
          <div className="ratings-items">
            {ratings.map((rating) => (
              <div key={rating.id} className="rating-item">
                <p>Anime ID: {rating.anime_id}</p>
                <p>Rating: {rating.rating}/10</p>
                {rating.review && <p className="review">{rating.review}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
