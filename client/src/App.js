import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import './styles/global.css';

// ── Lazy-loaded pages (code splitting per route) ──────────────────────
const Register  = lazy(() => import('./pages/Register'));
const Login     = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Attendance = lazy(() => import('./pages/Attendance'));
const NotFound  = lazy(() => import('./pages/NotFound'));

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div id="app-root">
        <Navbar />
        <main className="app-main">
          <Suspense fallback={<PageLoader text="Loading…" />}>
            <Routes>
              {/* Public routes */}
              <Route path="/"         element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login"    element={<Login />} />

              {/* Protected routes — require valid JWT */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                }
              />

              {/*
               * Future protected routes can be added here:
               *   /history    — AttendanceHistory page
               *   /admin/*    — Admin dashboard (role-gated ProtectedRoute)
               *   /profile    — Edit profile / re-upload photo
               */}

              {/* Fallback */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*"    element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
