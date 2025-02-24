import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import CustomerInfoForm from './forms/CustomerInfoForm';
import DebtInfoForm from './forms/DebtInfoForm';
import LoanRequestForm from './forms/LoanRequestForm';
import PropertyDetailsForm from './forms/PropertyDetailsForm';
import MarketFactorsForm from './forms/MarketFactorsForm';

const ApplicationForm = () => {
  const { id } = useParams();
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v2/loan-applications/${id}/`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError(null);

    try {
      // Update the application
      const updateResponse = await fetch(`http://localhost:8000/api/v2/loan-applications/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update application');
      }

      // Generate analysis
      const analysisResponse = await fetch(`http://localhost:8000/api/v2/loan-analyses/generate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loan_application_id: id })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to generate analysis');
      }

      const analysisData = await analysisResponse.json();
      navigate(`/v2/analysis/${analysisData.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading application data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Application Details</h1>
        <p className="mt-2 text-gray-600">
          Please review and update the information extracted from your description.
          All fields can be edited for accuracy.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          <CustomerInfoForm
            data={application}
            onChange={(data) => setApplication({ ...application, ...data })}
          />
          
          <DebtInfoForm
            data={application}
            onChange={(data) => setApplication({ ...application, ...data })}
          />
          
          <LoanRequestForm
            data={application}
            onChange={(data) => setApplication({ ...application, ...data })}
          />
          
          <PropertyDetailsForm
            data={application}
            onChange={(data) => setApplication({ ...application, ...data })}
          />
          
          <MarketFactorsForm
            data={application}
            onChange={(data) => setApplication({ ...application, ...data })}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Generating Analysis...' : 'Generate Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
