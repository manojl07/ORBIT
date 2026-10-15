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

import RequestGooglePasswordSetup from "../pages/RequestGooglePasswordSetup";
import SetupPassword from "../pages/SetupPassword";

import SavedPosts from "../pages/SavedPosts";

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
        path="/setup-password/request"
        element={
          <PublicRoute>
            <RequestGooglePasswordSetup />
          </PublicRoute>
        }
      />

      <Route
        path="/setup-password"
        element={<SetupPassword />}
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

      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SavedPosts />
            </MainLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;