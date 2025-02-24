import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import html2canvas from 'html2canvas';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Assessment,
  Person,
  Phone,
  Business,
  AttachMoney,
  CreditScore,
  AccountBalance,
  Home,
  TrendingUp,
  Warning,
  CheckCircle,
  Lightbulb,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from 'recharts';
import { jsPDF } from 'jspdf';

const AnalysisReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

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

  const parseAnalysisResult = (analysis) => {
    if (!analysis?.analysis_result) return null;
    
    const result = typeof analysis.analysis_result === 'string' 
      ? JSON.parse(analysis.analysis_result) 
      : analysis.analysis_result;

    return result;
  };

  const renderRiskAnalysis = (result) => {
    if (!result?.credit_risk_analysis) return null;
    const risk = result.credit_risk_analysis;

    return (
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CreditScore sx={{ mr: 1 }} />
              <Typography variant="h6">Credit Risk Analysis</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Risk Score</Typography>
                <Typography variant="h6">{risk.risk_score}/100</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Approval Probability</Typography>
                <Typography variant="h6">{risk.approval_probability}%</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Risk Factors:</Typography>
                <List dense>
                  {risk.risk_factors.map((factor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={factor} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderFinancialMetrics = (result) => {
    if (!result?.financial_metrics) return null;
    const metrics = result.financial_metrics;

    return (
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalance sx={{ mr: 1 }} />
              <Typography variant="h6">Financial Metrics</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">DTI Ratio</Typography>
                <Typography variant="h6">{metrics.debt_to_income_ratio}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">LTV Ratio</Typography>
                <Typography variant="h6">{metrics.loan_to_value_ratio}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Credit Utilization</Typography>
                <Typography variant="h6">{metrics.credit_utilization}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Savings Rate</Typography>
                <Typography variant="h6">{metrics.savings_rate}%</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderCharts = (result) => {
    if (!result?.chart_data) return null;
    const chartData = result.chart_data;

    // Prepare data for charts
    const debtBreakdownData = Object.entries(chartData.debt_breakdown).map(([name, value]) => ({
      name,
      value
    }));

    const incomeExpensesData = Object.entries(chartData.income_vs_expenses).map(([name, value]) => ({
      name,
      value
    }));

    const netWorthData = Object.entries(chartData.net_worth_composition).map(([name, value]) => ({
      name,
      value
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
      <>
        {/* Debt Breakdown */}
        <Grid item xs={12} md={6}>
          <Card id="debt-breakdown-chart">
            <CardContent>
              <Typography variant="h6" gutterBottom>Debt Breakdown</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={debtBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {debtBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Income vs Expenses */}
        <Grid item xs={12} md={6}>
          <Card id="income-expenses-chart">
            <CardContent>
              <Typography variant="h6" gutterBottom>Income vs Expenses</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeExpensesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Net Worth Composition */}
        <Grid item xs={12} md={6}>
          <Card id="net-worth-chart">
            <CardContent>
              <Typography variant="h6" gutterBottom>Net Worth Composition</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={netWorthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {netWorthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Amortization */}
        <Grid item xs={12}>
          <Card id="amortization-chart">
            <CardContent>
              <Typography variant="h6" gutterBottom>Loan Amortization Schedule</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.loan_amortization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="principal_paid" stroke="#8884d8" name="Principal Paid" />
                  <Line type="monotone" dataKey="interest_paid" stroke="#82ca9d" name="Interest Paid" />
                  <Line type="monotone" dataKey="remaining_balance" stroke="#ffc658" name="Remaining Balance" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const result = parseAnalysisResult(analysis);
    
    // Helper function to add a new page if needed
    const addPageIfNeeded = (height) => {
      if (doc.internal.getCurrentPageInfo().pageNumber === 1) {
        if (doc.internal.getCurrentPageInfo().pageNumber * doc.internal.pageSize.height - doc.internal.getVerticalCoordinateString() < height) {
          doc.addPage();
        }
      }
    };

    // Title
    doc.setFontSize(24);
    doc.text('Loan Analysis Report', 20, 20);
    doc.setFontSize(12);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    let yPos = 40;

    // Executive Summary Section
    doc.setFontSize(18);
    doc.text('Executive Summary', 20, yPos);
    yPos += 10;
    
    // Overall Assessment
    doc.setFontSize(12);
    const assessment = doc.splitTextToSize(result.summary.overall_assessment, 170);
    doc.text(assessment, 20, yPos);
    yPos += assessment.length * 7 + 10;

    // Key Strengths
    doc.setFontSize(14);
    doc.text('Key Strengths:', 20, yPos);
    yPos += 7;
    doc.setFontSize(12);
    result.summary.key_strengths.forEach(strength => {
      doc.text('• ' + strength, 25, yPos);
      yPos += 7;
    });
    yPos += 5;

    // Key Concerns
    doc.setFontSize(14);
    doc.text('Key Concerns:', 20, yPos);
    yPos += 7;
    doc.setFontSize(12);
    result.summary.key_concerns.forEach(concern => {
      doc.text('• ' + concern, 25, yPos);
      yPos += 7;
    });
    yPos += 5;

    // Recommendations
    doc.setFontSize(14);
    doc.text('Recommendations:', 20, yPos);
    yPos += 7;
    doc.setFontSize(12);
    result.summary.recommendations.forEach(rec => {
      const recText = doc.splitTextToSize('• ' + rec, 165);
      doc.text(recText, 25, yPos);
      yPos += recText.length * 7;
    });
    yPos += 10;

    // Add a new page for metrics and charts
    doc.addPage();
    yPos = 20;

    // Financial Metrics
    doc.setFontSize(18);
    doc.text('Financial Metrics', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    
    const metrics = [
      ['Debt-to-Income Ratio:', `${result.financial_metrics.debt_to_income_ratio}%`],
      ['Loan-to-Value Ratio:', `${result.financial_metrics.loan_to_value_ratio}%`],
      ['Credit Utilization:', `${result.financial_metrics.credit_utilization}%`],
      ['Monthly Payment:', `$${result.loan_metrics.monthly_payment.toLocaleString()}`],
      ['Total Interest:', `$${result.loan_metrics.total_interest_paid.toLocaleString()}`],
      ['Break-even Years:', result.loan_metrics.break_even_years.toString()]
    ];

    metrics.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 25, yPos);
      yPos += 7;
    });
    yPos += 10;

    // Capture and add charts
    const chartIds = [
      'debt-breakdown-chart',
      'income-expenses-chart',
      'net-worth-chart',
      'amortization-chart'
    ];

    for (const chartId of chartIds) {
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        try {
          // Add new page for each chart
          doc.addPage();
          
          const canvas = await html2canvas(chartElement);
          const imgData = canvas.toDataURL('image/png');
          
          // Calculate aspect ratio to fit chart on page
          const imgWidth = doc.internal.pageSize.getWidth() - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          doc.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
        } catch (error) {
          console.error(`Error capturing chart ${chartId}:`, error);
        }
      }
    }

    // Save the PDF
    const fileName = `loan-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const result = parseAnalysisResult(analysis);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} ref={reportRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Loan Analysis Report
        </Typography>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={generatePDF}
        >
          Download PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1 }} />
                <Typography variant="h5">Executive Summary</Typography>
              </Box>
              
              {/* Overall Assessment */}
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {result?.summary?.overall_assessment}
              </Typography>

              <Grid container spacing={3}>
                {/* Key Strengths */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    bgcolor: 'success.light', 
                    p: 2, 
                    borderRadius: 1,
                    height: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: 'success.contrastText', mb: 2 }}>
                      Key Strengths
                    </Typography>
                    <List dense>
                      {result?.summary?.key_strengths.map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle sx={{ color: 'success.contrastText' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={strength}
                            sx={{ color: 'success.contrastText' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>

                {/* Key Concerns */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    bgcolor: 'warning.light', 
                    p: 2, 
                    borderRadius: 1,
                    height: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: 'warning.contrastText', mb: 2 }}>
                      Key Concerns
                    </Typography>
                    <List dense>
                      {result?.summary?.key_concerns.map((concern, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Warning sx={{ color: 'warning.contrastText' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={concern}
                            sx={{ color: 'warning.contrastText' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>

                {/* Recommendations */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    bgcolor: 'primary.light', 
                    p: 2, 
                    borderRadius: 1 
                  }}>
                    <Typography variant="h6" sx={{ color: 'primary.contrastText', mb: 2 }}>
                      Recommendations
                    </Typography>
                    <List dense>
                      {result?.summary?.recommendations.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Lightbulb sx={{ color: 'primary.contrastText' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={recommendation}
                            sx={{ color: 'primary.contrastText' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Analysis Section */}
        {renderRiskAnalysis(result)}

        {/* Financial Metrics Section */}
        {renderFinancialMetrics(result)}

        {/* Property Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Home sx={{ mr: 1 }} />
                <Typography variant="h6">Property Analysis</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">5-Year Growth</Typography>
                  <Typography variant="h6">{result?.property_analysis?.property_value_growth_5yr}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Market Risk</Typography>
                  <Typography variant="h6">{result?.property_analysis?.market_risk}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Property Tax Rate</Typography>
                  <Typography variant="h6">{result?.property_analysis?.property_tax_rate}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Economic Factors */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Economic Factors</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Economic Risk</Typography>
                  <Typography variant="h6">{result?.economic_factors?.economic_conditions_risk}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Inflation Rate</Typography>
                  <Typography variant="h6">{result?.economic_factors?.inflation_rate}%</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Interest Rate Trend</Typography>
                  <Typography variant="h6">{result?.economic_factors?.interest_rate_trend}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Section */}
        {renderCharts(result)}
      </Grid>
    </Container>
  );
};

export default AnalysisReport;
