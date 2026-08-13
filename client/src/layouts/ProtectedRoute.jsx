import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/ui/Loader';


const ProtectedRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <Loader />
    )
  }

  if (!user) {
    return (
      <Navigate to='/login' />
    )
  }

  return children;
}

export default ProtectedRoute;