import React, { useState, useCallback } from 'react'
import './LoginSignup.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const LoginSignup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Secure token storage
  const storeToken = useCallback((token, user) => {
    try {
      // Store token securely
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify({
        id: user.id,
        consumerName: user.consumerName,
        consumerNo: user.consumerNo,
        deviceId: user.deviceId
      }));

      // Store device ID for MasterPage4 compatibility
      if (user.deviceId && user.deviceId.length > 0) {
        sessionStorage.setItem('userDeviceId', user.deviceId[0]);
      }

      // Set axios default header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error storing authentication data:', error);
      throw new Error('Failed to store authentication data');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Input validation
    if (!username?.trim()) {
      setError('Username is required.');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Handle hardcoded admin users (should be removed in production)
    if (username === 'master') {
      setError('');
      setLoading(false);
      navigate('/master');
      return;
    } else if (username === 'eb') {
      setError('');
      setLoading(false);
      navigate('/devices');
      return;
    }

    // Regular user login
    try {
      const response = await api.post('/login', {
        consumerNo: username.trim(),
        password: password
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store authentication data securely
      storeToken(token, user);

      // Navigate to user dashboard
      navigate('/connecteddevices', {
        state: {
          user,
          loginTime: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error('Login error:', err);

      if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ECONNABORTED') {
        setError('Login request timed out. Please try again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <h1>WELCOME</h1>
        <div className="form-wrapper">
          <form className="form" onSubmit={handleSubmit}>
            <p className="form-title">Login to your account</p>

            <div className="input-container">
              <input
                type="text"
                id="username"
                placeholder="Consumer Number"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
                maxLength={50}
              />
            </div>

            <div className="input-container">
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="form-footer">
              <p>Secure login with encrypted connection</p>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default LoginSignup