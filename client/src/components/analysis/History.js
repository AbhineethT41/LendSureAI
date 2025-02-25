import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  Person,
  AccessTime,
  Phone,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const History = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCustomerName = (analysis) => {
    try {
      const result = analysis.analysis_result;
      if (typeof result === 'string') {
        const parsedResult = JSON.parse(result);
        const match = parsedResult.summary.overall_assessment.match(/^([^']+)'s/);
        return match ? match[1] : 'N/A';
      }
      const match = result.summary.overall_assessment.match(/^([^']+)'s/);
      return match ? match[1] : 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  const getDecision = (analysis) => {
    // Simply return the status from the analyses table
    return analysis.status || 'PENDING';
  };

  const getDecisionColor = (decision) => {
    switch (decision?.toUpperCase()) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'MARK FOR REVIEW':
        return 'info';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analyses/', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon fontSize="large" />
          Analysis History
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/new-analysis')}
        >
          New Analysis
        </Button>
      </Box>

      {analyses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No analyses found</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {analyses.map((analysis) => (
            <Grid item xs={12} sm={6} md={4} key={analysis.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/analysis/${analysis.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person />
                        {getCustomerName(analysis)}
                      </Box>
                    </Typography>
                    <Chip
                      label={getDecision(analysis)}
                      color={getDecisionColor(getDecision(analysis))}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {analysis.customer_phone}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(analysis.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default History;
