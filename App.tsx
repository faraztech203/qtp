import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicPortal from './pages/PublicPortal';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Simple NotFound component for unauthorized/invalid routes
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
      <p className="text-slate-500 text-xl">The page you are looking for does not exist.</p>
      <a href="/" className="mt-6 inline-block text-[#0b3d91] hover:underline font-medium">
        Go back to home
      </a>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<PublicPortal />} />

        {/* Private Admin Routes - Hidden from public UI */}
        <Route path="/secure-portal-9xA82" element={<AdminLogin />} />
        <Route path="/secure-portal-9xA82/dashboard" element={<AdminDashboard />} />

        {/* Fallback to 404 for any other route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
