import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../shared/api/apiClient';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      
      setStatus('success');
      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Email verification failed. Please try again.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setResending(true);

    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      alert(response.data.message);
      setEmail('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h1>Verifying Email</h1>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h1>Verification Failed</h1>
            <p className="error-message">{message}</p>

            <div className="resend-section">
              <h3>Need a new verification link?</h3>
              <form onSubmit={handleResendVerification}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={resending}>
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
            </div>

            <button 
              className="back-button"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
