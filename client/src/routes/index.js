import React from 'react';
import { Navigate } from 'react-router-dom';
import v2Routes from './v2';

// Layout components
import MainLayout from '../components/layouts/MainLayout';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/v2/new" replace />
      },
      ...v2Routes
    ]
  }
];

export default routes;
