import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

const NewAnalysis = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [naturalText, setNaturalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!naturalText.trim()) {
        throw new Error('Please provide some information about the loan application');
      }

      // Create loan application with natural text
      const response = await fetch('http://localhost:8000/api/v2/loan-applications/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_input_text: naturalText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create loan application');
      }

      const data = await response.json();
      // Navigate to the form page with the application ID
      navigate(`/v2/applications/${data.id}/edit`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Loan Analysis</h1>
        <p className="mt-2 text-gray-600">
          Describe the loan application in natural language. Include details about the customer,
          their financial situation, and the loan they're seeking.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="naturalText"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Loan Application Description
          </label>
          <textarea
            id="naturalText"
            name="naturalText"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Example: John Smith is a 35-year-old software engineer at Tech Corp, earning $120,000 annually. He's looking for a $500,000 mortgage for a condo in San Francisco..."
            value={naturalText}
            onChange={(e) => setNaturalText(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAnalysis;
