import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-container flex justify-center mt-xl"><Loader text="Loading session..." /></div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to respective dashboard if role mismatch
    const fallbackRoute = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}

export default ProtectedRoute;

