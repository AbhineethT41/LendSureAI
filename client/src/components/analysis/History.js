import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analyses/', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analyses');
      }

      const data = await response.json();
      setAnalyses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
        <button
          onClick={() => navigate('/new-analysis')}
          className="btn btn-primary"
        >
          New Analysis
        </button>
      </div>

      <div className="space-y-6">
        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No analyses found</p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <div key={analysis.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {analysis.customer_phone}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                  className="btn btn-secondary"
                >
                  View Analysis
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
