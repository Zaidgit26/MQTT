import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (requireAuth && !authenticated) {
    // Redirect to login page with return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!requireAuth && authenticated) {
    // Redirect authenticated users away from login page
    return <Navigate to="/connecteddevices" replace />;
  }

  return children;
};

export default ProtectedRoute;
