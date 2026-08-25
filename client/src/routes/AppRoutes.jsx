import React from 'react'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Feed from '../pages/Feed'
import Profile from '../pages/Profile'

import ProtectedRoute from '../layouts/ProtectedRoute'
import { Route, Routes } from 'react-router-dom'
import PublicRoute from '../layouts/PublicRoute'
import MainLayout from '../layouts/MainLayout'


const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

      <Route
        path='/register'
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path='/'
        element={
          <ProtectedRoute>
            <MainLayout>
              <Feed />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Own profile */}
      <Route path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />


      {/* Other user profile */}
      <Route path='/profile/:userId' element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AppRoutes