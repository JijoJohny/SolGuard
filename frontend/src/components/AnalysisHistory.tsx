import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchProjectAnalyses } from '../store/slices/analysisSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisHistoryProps {
  projectId: string;
}

interface AnalysisDetails {
  id: string;
  vulnerabilities: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    location: string;
    recommendation: string;
  }>;
  codeSnippets: Array<{
    id: string;
    code: string;
    language: string;
  }>;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ projectId }) => {
  const dispatch = useDispatch();
  const { analyses, loading, error } = useSelector(
    (state: RootState) => state.analysis
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectAnalyses(projectId));
  }, [dispatch, projectId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleRowClick = (analysisId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(analysisId)) {
      newExpandedRows.delete(analysisId);
    } else {
      newExpandedRows.add(analysisId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleViewDetails = (analysisId: string) => {
    // Mock data - replace with actual API call
    const mockDetails: AnalysisDetails = {
      id: analysisId,
      vulnerabilities: [
        {
          id: '1',
          title: 'Potential Reentrancy Attack',
          description: 'Function allows reentrancy which could lead to double-spending',
          severity: 'high',
          location: 'src/program.rs:45',
          recommendation: 'Implement checks-effects-interactions pattern',
        },
      ],
      codeSnippets: [
        {
          id: '1',
          code: 'pub fn withdraw(&mut self, amount: u64) -> Result<()> {\n    // Vulnerable code\n}',
          language: 'rust',
        },
      ],
    };
    setSelectedAnalysis(mockDetails);
    setDetailsDialogOpen(true);
  };

  const handleDownloadReport = (analysisId: string) => {
    // Implement report download logic
    console.log('Downloading report for analysis:', analysisId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Analysis History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Date</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Vulnerabilities</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {analyses.map((analysis) => (
                <motion.tr
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TableCell padding="checkbox">
                    <IconButton
                      size="small"
                      onClick={() => handleRowClick(analysis.id)}
                    >
                      {expandedRows.has(analysis.id) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                  <TableCell>{analysis.filePath}</TableCell>
                  <TableCell>
                    <Chip
                      label={analysis.status}
                      color={
                        analysis.status === 'Completed'
                          ? 'success'
                          : analysis.status === 'In Progress'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={analysis.severity}
                      color={getSeverityColor(analysis.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{analysis.vulnerabilityCount}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(analysis.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Report">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReport(analysis.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {analyses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No analyses performed yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Analysis Details
          {selectedAnalysis && (
            <Typography variant="subtitle2" color="text.secondary">
              {formatDate(selectedAnalysis.id)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedAnalysis && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vulnerabilities
              </Typography>
              {selectedAnalysis.vulnerabilities.map((vuln) => (
                <Paper
                  key={vuln.id}
                  sx={{ p: 2, mb: 2, backgroundColor: `${getSeverityColor(vuln.severity)}15` }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BugReportIcon
                      sx={{ color: getSeverityColor(vuln.severity), mr: 1 }}
                    />
                    <Typography variant="subtitle1">{vuln.title}</Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    {vuln.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Location: {vuln.location}
                  </Typography>
                  <Typography variant="body2">
                    Recommendation: {vuln.recommendation}
                  </Typography>
                </Paper>
              ))}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Code Snippets
              </Typography>
              {selectedAnalysis.codeSnippets.map((snippet) => (
                <Paper key={snippet.id} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CodeIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">
                      {snippet.language.toUpperCase()}
                    </Typography>
                  </Box>
                  <pre
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '1rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                    }}
                  >
                    {snippet.code}
                  </pre>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => selectedAnalysis && handleDownloadReport(selectedAnalysis.id)}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 