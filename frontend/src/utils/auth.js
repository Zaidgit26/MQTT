// Authentication utilities
export const AUTH_TOKEN_KEY = 'token';
export const USER_DATA_KEY = 'user';

/**
 * Get authentication token from storage
 * @returns {string|null} Token or null if not found
 */
export const getAuthToken = () => {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get user data from storage
 * @returns {object|null} User data or null if not found
 */
export const getUserData = () => {
  try {
    const userData = sessionStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  
  if (!token || !userData) {
    return false;
  }

  // Check if token is expired (basic check)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      clearAuthData();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    clearAuthData();
    return false;
  }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Store authentication data
 * @param {string} token - JWT token
 * @param {object} userData - User data object
 */
export const storeAuthData = (token, userData) => {
  try {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw new Error('Failed to store authentication data');
  }
};

/**
 * Get authorization header for API requests
 * @returns {object} Authorization header object
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Logout user and clear all data
 */
export const logout = () => {
  clearAuthData();
  // Redirect to login page
  window.location.href = '/';
};
