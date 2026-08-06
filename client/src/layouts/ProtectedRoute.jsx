import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


const ProtectedRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>Loading...</div>
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