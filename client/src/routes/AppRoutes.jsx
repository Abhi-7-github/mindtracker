import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader } from '../components/ui/Loader';

// Pages Import
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { AIVoiceCheckin } from '../pages/AIVoiceCheckin';
import { AIReport } from '../pages/AIReport';
import { Psychologists } from '../pages/Psychologists';
import { Appointments } from '../pages/Appointments';
import { Meeting } from '../pages/Meeting';
import { Journal } from '../pages/Journal';
import { Notifications } from '../pages/Notifications';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { AdminDashboard } from '../pages/AdminDashboard';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#F5F5F5]"><Loader text="Restoring Session..." /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const RequireRole = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#F5F5F5]"><Loader text="Verifying Permissions..." /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export const AppRoutes = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/voice-checkin" element={<RequireAuth><AIVoiceCheckin /></RequireAuth>} />
      <Route path="/ai-report/:sessionId" element={<RequireAuth><AIReport /></RequireAuth>} />
      <Route path="/psychologists" element={<RequireAuth><Psychologists /></RequireAuth>} />
      <Route path="/appointments" element={<RequireAuth><Appointments /></RequireAuth>} />
      <Route path="/meeting/:roomId" element={<RequireAuth><Meeting /></RequireAuth>} />
      <Route path="/journal" element={<RequireAuth><Journal /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

      {/* Admin Route */}
      <Route path="/admin" element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
