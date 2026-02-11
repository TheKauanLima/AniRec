import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './features/home/HomePage';
import RecommendationsPage from './features/recommendations/RecommendationsPage';
import AnimeDetailsPage from './features/anime/AnimeDetailsPage';
import ProfilePage from './features/profile/ProfilePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/anime/:id" element={<AnimeDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
