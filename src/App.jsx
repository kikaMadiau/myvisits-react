import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyOtp from '@/pages/VerifyOtp';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import MyVisits from '@/pages/MyVisits';
import VisitDetail from '@/pages/VisitDetail';
import Profile from '@/pages/Profile';
import UsersManagement from '@/pages/UsersManagement';
import AppSettings from '@/pages/AppSettings';
import SplashScreen from '@/components/SplashScreen';
import PwaStatus from '@/components/PwaStatus';

const LoginRedirect = () => {
  const location = useLocation();
  const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required') {
      return <LoginRedirect />;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<LoginRedirect />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/myvisits" element={<MyVisits />} />
          <Route path="/myvisits/:id" element={<VisitDetail />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/settings" element={<AppSettings />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/Profile" element={<Navigate to="/profil" replace />} />
          <Route path="/users-management" element={<Navigate to="/users" replace />} />
          <Route path="/app-settings" element={<Navigate to="/settings" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <PwaStatus />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
