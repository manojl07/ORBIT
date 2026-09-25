import React from "react";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Feed from "../pages/Feed";
import Profile from "../pages/Profile";
import ForgotPassword from "../pages/ForgetPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";

import ProtectedRoute from "../layouts/ProtectedRoute";
import PublicRoute from "../layouts/PublicRoute";
import MainLayout from "../layouts/MainLayout";

import {
  Route,
  Routes,
} from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>

      {/* AUTH */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <ResetPassword />
        }
      />

      <Route
        path="/verify-email"
        element={
          <VerifyEmail />
        }
      />

      {/* FEED */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Feed />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* OWN PROFILE */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* PUBLIC USER PROFILE */}

      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;