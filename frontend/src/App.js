import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { seedApi } from "@/lib/api";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ProviderSignupPage from "@/pages/ProviderSignupPage";
import CategoryPage from "@/pages/CategoryPage";
import ProvidersPage from "@/pages/ProvidersPage";
import ProviderDetailPage from "@/pages/ProviderDetailPage";
import BookingPage from "@/pages/BookingPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import ProviderDashboard from "@/pages/ProviderDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Role-based redirect
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <HomePage />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'provider':
      return <Navigate to="/provider/dashboard" replace />;
    default:
      return <HomePage />;
  }
};

function AppRoutes() {
  useEffect(() => {
    // Seed data on first load
    seedApi.seed().catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/provider-signup" element={<ProviderSignupPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/provider/:providerId" element={<ProviderDetailPage />} />
      <Route
        path="/book/:providerId"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
