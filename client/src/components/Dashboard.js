import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to LendSure AI</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover:shadow-lg cursor-pointer transition-shadow duration-200"
             onClick={() => navigate('/new-analysis')}>
          <div className="text-xl font-semibold text-gray-900 mb-2">New Analysis</div>
          <p className="text-gray-600">
            Start a new credit risk analysis by providing customer information.
          </p>
          <button className="btn btn-primary mt-4">
            Start New Analysis
          </button>
        </div>

        <div className="card hover:shadow-lg cursor-pointer transition-shadow duration-200"
             onClick={() => navigate('/history')}>
          <div className="text-xl font-semibold text-gray-900 mb-2">History</div>
          <p className="text-gray-600">
            View your previous credit risk analyses and their results.
          </p>
          <button className="btn btn-secondary mt-4">
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
