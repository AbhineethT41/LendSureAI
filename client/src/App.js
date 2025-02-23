import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import NewAnalysis from './components/analysis/NewAnalysis';
import History from './components/analysis/History';
import AnalysisReport from './components/analysis/AnalysisReport';
import PrivateRoute from './components/auth/PrivateRoute';

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login supabase={supabase} />} />
        <Route path="/register" element={<Register supabase={supabase} />} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute supabase={supabase} />}>
          <Route index element={<Dashboard />} />
          <Route path="new-analysis" element={<NewAnalysis />} />
          <Route path="history" element={<History />} />
          <Route path="analysis/:id" element={<AnalysisReport />} />
        </Route>

        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
