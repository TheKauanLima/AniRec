import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import './AuthPages.css';

const MALCallbackPage = () => {
    const [status, setStatus] = useState('Processing MAL login...');
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code) {
                setError('No authorization code received from MAL.');
                return;
            }

            // Retrieve PKCE verifier from sessionStorage
            const codeVerifier = sessionStorage.getItem('mal_code_verifier');
            const savedState = sessionStorage.getItem('mal_state');

            if (!codeVerifier) {
                setError('Session expired. Please try logging in again.');
                return;
            }

            // Validate state to prevent CSRF
            if (state !== savedState) {
                setError('Invalid state parameter. Please try logging in again.');
                return;
            }

            try {
                setStatus('Exchanging credentials with MyAnimeList...');

                // Check if the user is already logged in (linking flow)
                const existingToken = localStorage.getItem('token');
                const existingUser = localStorage.getItem('user');
                let linkToUserId = null;

                if (existingToken && existingUser) {
                    try {
                        linkToUserId = JSON.parse(existingUser).id;
                    } catch (e) {
                        // Not logged in, proceed with new account creation
                    }
                }

                const response = await apiClient.post('/auth/mal/callback', {
                    code,
                    codeVerifier,
                    state,
                    linkToUserId,
                });

                // Clean up session storage
                sessionStorage.removeItem('mal_code_verifier');
                sessionStorage.removeItem('mal_state');

                // Store auth data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                setStatus('Login successful. Importing your MAL list...');

                try {
                    await apiClient.post('/auth/mal/import');
                    setStatus('Import complete! Redirecting...');
                } catch (importError) {
                    console.warn('MAL import failed after login:', importError.response?.data || importError.message);
                    setStatus('Logged in. Redirecting...');
                }

                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } catch (err) {
                console.error('MAL callback error:', err);
                setError(err.response?.data?.error || 'MAL authentication failed. Please try again.');
                sessionStorage.removeItem('mal_code_verifier');
                sessionStorage.removeItem('mal_state');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <h1>MyAnimeList Login</h1>
                {error ? (
                    <>
                        <div className="error-message">{error}</div>
                        <button
                            className="btn-submit"
                            onClick={() => navigate('/login')}
                            style={{ marginTop: '1rem' }}
                        >
                            Back to Login
                        </button>
                    </>
                ) : (
                    <p style={{ color: '#ccc' }}>{status}</p>
                )}
            </div>
        </div>
    );
};

export default MALCallbackPage;
