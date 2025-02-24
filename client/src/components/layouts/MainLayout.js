import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
