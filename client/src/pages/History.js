import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'review':
        return 'info';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Analysis History
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/new-analysis')}
        >
          NEW ANALYSIS
        </Button>
      </Box>

      <Grid container spacing={4}>
        {analyses.map((analysis) => (
          <Grid item xs={12} md={4} key={analysis.id}>
            <Card
              sx={{
                height: '100%',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ flex: 1, p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" component="h2" sx={{ fontSize: '1.5rem' }}>
                    Application #{analysis.id}
                  </Typography>
                  <Chip
                    label={analysis.status || 'Pending'}
                    color={getStatusColor(analysis.status)}
                    sx={{ 
                      fontWeight: 'bold', 
                      fontSize: '1rem', 
                      py: 1.5, 
                      px: 2.5,
                      height: 'auto' 
                    }}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="h6" sx={{ fontSize: '1.3rem' }}>
                        {analysis.customer_name || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PhoneIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {analysis.customer_phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AttachMoneyIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                        Loan Amount: ${analysis.loan_amount?.toLocaleString() || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AccessTimeIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {formatDate(analysis.created_at)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    startIcon={<VisibilityIcon />}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    View Analysis
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default History;
