import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/auth/v2/ProtectedRoute';
import NewAnalysis from '../components/analysis/v2/NewAnalysis';
import ApplicationForm from '../components/analysis/v2/ApplicationForm';
import AnalysisResult from '../components/analysis/v2/AnalysisResult';

const v2Routes = {
  path: '/v2',
  element: <ProtectedRoute />,
  children: [
    {
      path: '',
      element: <Navigate to="new" replace />
    },
    {
      path: 'new',
      element: <NewAnalysis />
    },
    {
      path: 'applications/:id/edit',
      element: <ApplicationForm />
    },
    {
      path: 'analysis/:id',
      element: <AnalysisResult />
    }
  ]
};

export default v2Routes;
