import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const NewAnalysis = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [customerInput, setCustomerInput] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate customer input is not empty
      if (!customerInput.trim()) {
        throw new Error('Customer information cannot be empty');
      }

      // Validate phone number
      if (!customerPhone.trim()) {
        throw new Error('Customer phone number is required');
      }

      const response = await fetch('http://localhost:8000/api/analyses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          customer_input: customerInput,
          customer_phone: customerPhone,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create analysis');
      }

      navigate(`/analysis/${data.id}`);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to create analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Analysis</h1>
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Phone Number
            </label>
            <input
              type="tel"
              required
              className="input-field"
              placeholder="Enter customer phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Information
            </label>
            <textarea
              required
              className="input-field min-h-[200px]"
              placeholder="Enter unstructured customer information..."
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewAnalysis;
