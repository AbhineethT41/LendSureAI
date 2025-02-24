import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = () => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
