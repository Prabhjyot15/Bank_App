import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const PublicRoute = ({ redirectPath = '/details' }) => {
// eslint-disable-next-line
  const { user, token } = useAuth();

  if (user && token) {
    // If there is a user and token in the context, redirect to the user details page
    return <Navigate to={redirectPath} replace />;
  }
else
  return <Outlet />;
};
