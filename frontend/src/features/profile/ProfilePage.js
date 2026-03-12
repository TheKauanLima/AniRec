import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import './ProfilePage.css';

const ProfilePage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from storage:', error);
      }
    }

    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, watchlistRes, ratingsRes] = await Promise.all([
        apiClient.get('/users/profile'),
        apiClient.get('/users/watchlist'),
        apiClient.get('/users/ratings'),
      ]);

      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const fetchedUser = profileRes.data.user || {};
      const mergedUser = {
        ...existingUser,
        ...fetchedUser,
        profilePicture: fetchedUser.profilePicture || existingUser.profilePicture || null,
      };

      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setWatchlist(watchlistRes.data.watchlist);
      setRatings(ratingsRes.data.ratings);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  const displayName = user?.username || user?.malUsername || 'User';
  const profilePicture = user?.profilePicture || user?.avatar || null;

  return (
    <div className="profile-page">
      <div className="container">
        <header className="profile-hero">
          <div className="profile-hero-content">
            <p className="profile-kicker">AniRec Profile</p>
            <h1>Hi, {displayName}.</h1>
            <p className="profile-subtitle">
              Keep track of what you watched, rated, and what to queue up next.
            </p>
          </div>

          <div className="profile-avatar-wrap" aria-label="User profile picture">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`${displayName} profile`}
                className="profile-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="profile-avatar profile-avatar-empty" aria-hidden="true" />
            )}
          </div>
        </header>

        <section className="profile-stats" aria-label="Profile stats">
          <article className="stat-card">
            <p className="stat-label">Watchlist</p>
            <p className="stat-value">{watchlist.length}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Ratings</p>
            <p className="stat-value">{ratings.length}</p>
          </article>
        </section>

        <section className="profile-section">
          <h2>Watchlist</h2>
          <div className="watchlist-items">
            {watchlist.length === 0 && (
              <p className="empty-state">No watchlist items yet.</p>
            )}
            {watchlist.map((item) => (
              <div key={item.id} className="watchlist-item">
                <p className="item-title">Anime #{item.anime_id}</p>
                <p className="item-meta">Status: {item.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2>Ratings</h2>
          <div className="ratings-items">
            {ratings.length === 0 && (
              <p className="empty-state">No ratings yet.</p>
            )}
            {ratings.map((rating) => (
              <div key={rating.id} className="rating-item">
                <p className="item-title">Anime #{rating.anime_id}</p>
                <p className="item-meta">Rating: {rating.rating}/10</p>
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
