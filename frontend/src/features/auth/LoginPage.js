import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData?.requiresVerification) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        setError(errorData?.error || 'Login failed');
      }
    }
  };

  const handleMALLogin = async () => {
    setError('');
    try {
      const response = await apiClient.get('/auth/mal/auth-url');
      const { authUrl, codeVerifier, state } = response.data;

      // Store PKCE verifier and state in sessionStorage for the callback
      sessionStorage.setItem('mal_code_verifier', codeVerifier);
      sessionStorage.setItem('mal_state', state);

      // Redirect to MAL authorization page
      window.location.href = authUrl;
    } catch (error) {
      setError('Failed to start MAL login. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-submit">Login</button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button type="button" className="btn-mal" onClick={handleMALLogin}>
          Login with MyAnimeList
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
