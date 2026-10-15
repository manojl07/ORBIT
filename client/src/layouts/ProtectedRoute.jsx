import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import SkeletonCard from '../components/ui/SkeletonCard';


const ProtectedRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <SkeletonCard />
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