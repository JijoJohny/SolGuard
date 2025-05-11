import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Fade,
  Zoom,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  total,
  icon,
  color,
  trend,
  description,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 6,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: '50%',
                p: 1,
                mr: 2,
              }}
            >
              {icon}
            </Box>
          </motion.div>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {title}
              {description && (
                <Tooltip title={description} arrow>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
            <Typography variant="h4" component="div">
              {value}
              {total && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  / {total}
                </Typography>
              )}
            </Typography>
            {trend !== undefined && (
              <Tooltip title={`${trend > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(trend)}%`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: 1,
                    color: trend > 0 ? '#4caf50' : '#f44336',
                  }}
                >
                  <TrendingUpIcon
                    sx={{
                      transform: trend < 0 ? 'rotate(180deg)' : 'none',
                      fontSize: '1rem',
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {Math.abs(trend)}%
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
          {total && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: `${color}15`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: color,
                    transition: 'transform 1s ease-out',
                  },
                }}
              />
            </motion.div>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

interface ProjectMetricsProps {
  metrics: {
    totalAnalyses: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    securityScore: number;
    codeCoverage: number;
    lastAnalysisDate: string;
    trends?: {
      securityScore: number;
      codeCoverage: number;
      vulnerabilities: number;
    };
  };
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ metrics }) => {
  const {
    totalAnalyses,
    totalVulnerabilities,
    criticalVulnerabilities,
    highVulnerabilities,
    mediumVulnerabilities,
    lowVulnerabilities,
    securityScore,
    codeCoverage,
    lastAnalysisDate,
    trends,
  } = metrics;

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Project Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Security Score"
            value={securityScore}
            total={100}
            icon={<SecurityIcon sx={{ color: getSecurityScoreColor(securityScore) }} />}
            color={getSecurityScoreColor(securityScore)}
            trend={trends?.securityScore}
            description="Overall security score based on vulnerability analysis and best practices"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Code Coverage"
            value={codeCoverage}
            total={100}
            icon={<CodeIcon sx={{ color: '#2196f3' }} />}
            color="#2196f3"
            trend={trends?.codeCoverage}
            description="Percentage of code covered by security tests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Analyses"
            value={totalAnalyses}
            icon={<AssessmentIcon sx={{ color: '#9c27b0' }} />}
            color="#9c27b0"
            description="Number of security analyses performed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Vulnerabilities"
            value={totalVulnerabilities}
            icon={<BugReportIcon sx={{ color: '#f44336' }} />}
            color="#f44336"
            trend={trends?.vulnerabilities}
            description="Total number of security vulnerabilities found"
          />
        </Grid>
      </Grid>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Vulnerability Distribution
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Critical"
                value={criticalVulnerabilities}
                icon={<BugReportIcon sx={{ color: '#d32f2f' }} />}
                color="#d32f2f"
                description="Critical severity vulnerabilities requiring immediate attention"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="High"
                value={highVulnerabilities}
                icon={<BugReportIcon sx={{ color: '#f44336' }} />}
                color="#f44336"
                description="High severity vulnerabilities that should be addressed soon"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Medium"
                value={mediumVulnerabilities}
                icon={<BugReportIcon sx={{ color: '#ff9800' }} />}
                color="#ff9800"
                description="Medium severity vulnerabilities to be addressed in regular updates"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Low"
                value={lowVulnerabilities}
                icon={<BugReportIcon sx={{ color: '#4caf50' }} />}
                color="#4caf50"
                description="Low severity vulnerabilities that can be addressed during maintenance"
              />
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      <Fade in timeout={1000}>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Last Analysis: {new Date(lastAnalysisDate).toLocaleString()}
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}; 