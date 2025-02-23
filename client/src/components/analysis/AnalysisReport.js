import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const AnalysisReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/analyses/${id}/`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
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
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Credit Risk Analysis Report', 20, 20);
    
    // Add customer details
    doc.setFontSize(12);
    doc.text(`Customer Phone: ${analysis.customer_phone}`, 20, 40);
    doc.text(`Analysis Date: ${new Date(analysis.created_at).toLocaleDateString()}`, 20, 50);
    
    // Add analysis results
    doc.text('Analysis Results:', 20, 70);
    const result = analysis.analysis_result.choices[0].message.content;
    
    // Parse the JSON string if it's not already an object
    let parsedResult;
    try {
      parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      parsedResult = { error: 'Could not parse analysis result' };
    }
    
    // Add the formatted results
    let yPos = 80;
    Object.entries(parsedResult).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').toUpperCase();
      doc.text(`${formattedKey}:`, 20, yPos);
      
      // Handle multi-line text for long values
      const lines = doc.splitTextToSize(value.toString(), 170);
      lines.forEach(line => {
        yPos += 10;
        doc.text(line, 20, yPos);
      });
      
      yPos += 10;
    });
    
    // Save the PDF
    doc.save(`credit-analysis-${analysis.customer_phone}.pdf`);
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
        <h1 className="text-3xl font-bold text-gray-900">Analysis Report</h1>
        <div className="space-x-4">
          <button
            onClick={generatePDF}
            className="btn btn-secondary"
          >
            Download PDF
          </button>
          <button
            onClick={() => navigate('/history')}
            className="btn btn-secondary"
          >
            Back to History
          </button>
        </div>
      </div>

      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
          <p className="text-gray-600">Phone: {analysis.customer_phone}</p>
          <p className="text-gray-600">
            Date: {new Date(analysis.created_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Customer Information</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
            {analysis.customer_input}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
            {JSON.stringify(analysis.analysis_result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
