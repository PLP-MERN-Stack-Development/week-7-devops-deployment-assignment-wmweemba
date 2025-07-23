import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Borrowers } from '@/pages/Borrowers';
import { Loans } from '@/pages/Loans';
import { Payments } from '@/pages/Payments';
import { Reports } from '@/pages/Reports';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="borrowers" element={<Borrowers />} />
                <Route path="loans" element={<Loans />} />
                <Route path="payments" element={<Payments />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;