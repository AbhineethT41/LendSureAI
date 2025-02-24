import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';

const AnalysisResult = () => {
  const { id } = useParams();
  const { user } = useOutletContext();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v2/loan-analyses/${id}/`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading analysis results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const renderRiskScore = (score) => {
    let color;
    if (score >= 80) color = 'text-green-600';
    else if (score >= 60) color = 'text-yellow-600';
    else color = 'text-red-600';

    return <span className={color}>{score}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Loan Analysis Results</h1>
        <p className="mt-2 text-gray-600">
          Detailed analysis of the loan application for {analysis.customer_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analysis Card */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Risk Score</div>
              <div className="text-2xl font-bold">
                {renderRiskScore(analysis.risk_score)}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Approval Probability</div>
              <div className="text-2xl font-bold">
                {analysis.approval_probability}%
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Recommendation</div>
              <div className="text-lg font-medium">
                {analysis.approval_recommendation}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
          <ul className="list-disc list-inside mb-6">
            {analysis.risk_factors.map((factor, index) => (
              <li key={index} className="text-gray-700 mb-1">{factor}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mb-2">Loan Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Monthly Payment</div>
              <div className="font-medium">${analysis.monthly_payment}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Total Interest</div>
              <div className="font-medium">${analysis.total_interest_paid}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Break Even</div>
              <div className="font-medium">{analysis.break_even_years} years</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">DTI Ratio</div>
              <div className="font-medium">{analysis.debt_to_income_ratio}%</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">LTV Ratio</div>
              <div className="font-medium">{analysis.loan_to_value_ratio}%</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{analysis.customer_name}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Age</div>
                <div className="font-medium">{analysis.customer_age} years</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Occupation</div>
                <div className="font-medium">{analysis.job_title}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Annual Income</div>
                <div className="font-medium">${analysis.annual_income}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Credit Score</div>
                <div className="font-medium">{analysis.credit_score}</div>
              </div>
            </div>
          </div>

          {/* Market Factors Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Market Conditions</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Economic Risk</div>
                <div className="font-medium">{analysis.economic_conditions_risk}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Market Volatility</div>
                <div className="font-medium">{analysis.market_risk}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Interest Rate Trend</div>
                <div className="font-medium">{analysis.interest_rate_trend}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Inflation Rate</div>
                <div className="font-medium">{analysis.inflation_rate}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
