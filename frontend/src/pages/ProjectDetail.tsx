import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchProject } from '../store/slices/projectsSlice';
import { ProjectInfo } from '../components/ProjectInfo';
import { AnalysisHistory } from '../components/AnalysisHistory';
import { ProjectMetrics } from '../components/ProjectMetrics';
import { SecurityRecommendations } from '../components/SecurityRecommendations';
import { AIAnalysis } from '../components/AIAnalysis';
import { motion, AnimatePresence } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ p: 3 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <CircularProgress />
    </Box>
  </motion.div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Alert severity="error" sx={{ my: 2 }}>
      {message}
    </Alert>
  </motion.div>
);

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const { currentProject: project, loading, error } = useSelector(
    (state: RootState) => state.projects
  );

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || isPageLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!project) {
    return <ErrorAlert message="Project not found" />;
  }

  // Mock metrics data - replace with actual data from your API
  const mockMetrics = {
    totalAnalyses: 15,
    totalVulnerabilities: 8,
    criticalVulnerabilities: 1,
    highVulnerabilities: 2,
    mediumVulnerabilities: 3,
    lowVulnerabilities: 2,
    securityScore: 85,
    codeCoverage: 78,
    lastAnalysisDate: new Date().toISOString(),
    trends: {
      securityScore: 5,
      codeCoverage: -2,
      vulnerabilities: -10,
    },
  };

  // Mock recommendations data - replace with actual data from your API
  const mockRecommendations = [
    {
      id: '1',
      title: 'Implement Access Control',
      description: 'Add proper access control checks to sensitive functions',
      severity: 'high' as const,
      category: 'Access Control',
      status: 'pending' as const,
      codeExample: `#[access_control]
pub fn sensitive_function(ctx: Context<SensitiveFunction>) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.owner.key(),
        CustomError::Unauthorized
    );
    // Function implementation
}`,
      references: [
        'https://docs.solana.com/developing/programming-model/calling-between-programs',
      ],
    },
    {
      id: '2',
      title: 'Add Input Validation',
      description: 'Validate all user inputs to prevent malicious data',
      severity: 'medium' as const,
      category: 'Input Validation',
      status: 'in-progress' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate('/projects')}
                sx={{ textDecoration: 'none' }}
              >
                Projects
              </Link>
              <Typography color="text.primary">{project.name}</Typography>
            </Breadcrumbs>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ProjectInfo project={project} />
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="project tabs"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    },
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="AI Analysis" />
                  <Tab label="Analysis History" />
                  <Tab label="Security" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <ProjectMetrics metrics={mockMetrics} />
                    </Grid>
                    <Grid item xs={12}>
                      <SecurityRecommendations recommendations={mockRecommendations} />
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <AIAnalysis projectId={project.id} />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <AnalysisHistory projectId={project.id} />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <SecurityRecommendations recommendations={mockRecommendations} />
                </TabPanel>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
}; 