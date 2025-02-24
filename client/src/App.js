import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import { AuthProvider } from './components/auth/v2/AuthProvider';
import NewAnalysis from './components/analysis/v2/NewAnalysis';
import ApplicationForm from './components/analysis/v2/ApplicationForm';
import AnalysisResult from './components/analysis/v2/AnalysisResult';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <MainLayout>
                <NewAnalysis />
              </MainLayout>
            } 
          />
          <Route 
            path="/applications/:id/edit" 
            element={
              <MainLayout>
                <ApplicationForm />
              </MainLayout>
            } 
          />
          <Route 
            path="/analysis/:id" 
            element={
              <MainLayout>
                <AnalysisResult />
              </MainLayout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
