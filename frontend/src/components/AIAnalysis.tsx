import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  analyzeCode,
  generateCode,
  suggestImprovements,
  analyzeVulnerability,
  fetchSecurityPatterns,
  fetchModelConfigs,
  clearCurrentAnalysis,
  clearGeneratedCode,
  clearVulnerabilityAnalysis,
} from '../store/slices/aiSlice';
import { RootState } from '../store';
import { CodeBlock } from './CodeBlock';
import { SecurityPatternCard } from './SecurityPatternCard';
import { ModelConfigPanel } from './ModelConfigPanel';
import { SUCCESS_MESSAGES } from '../config';

interface AIAnalysisProps {
  projectId: string;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState('');
  const [requirements, setRequirements] = useState('');
  const [vulnerabilityId, setVulnerabilityId] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dispatch = useDispatch();
  const {
    currentAnalysis,
    generatedCode,
    vulnerabilityAnalysis,
    securityPatterns,
    modelConfigs,
    loading,
    error,
  } = useSelector((state: RootState) => state.ai);

  useEffect(() => {
    dispatch(fetchSecurityPatterns(projectId));
    dispatch(fetchModelConfigs(projectId));
  }, [dispatch, projectId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSuccessMessage(null);
    dispatch(clearCurrentAnalysis());
    dispatch(clearGeneratedCode());
    dispatch(clearVulnerabilityAnalysis());
  };

  const handleAnalyze = async () => {
    try {
      await dispatch(analyzeCode({ code, projectId }));
      setSuccessMessage(SUCCESS_MESSAGES.ANALYSIS_STARTED);
    } catch (err) {
      // Error is handled by the Redux state
    }
  };

  const handleGenerate = async () => {
    try {
      await dispatch(generateCode({ requirements, projectId }));
      setSuccessMessage(SUCCESS_MESSAGES.CODE_GENERATED);
    } catch (err) {
      // Error is handled by the Redux state
    }
  };

  const handleSuggest = async () => {
    try {
      await dispatch(suggestImprovements({ code, projectId }));
      setSuccessMessage(SUCCESS_MESSAGES.IMPROVEMENTS_SUGGESTED);
    } catch (err) {
      // Error is handled by the Redux state
    }
  };

  const handleAnalyzeVulnerability = async () => {
    try {
      await dispatch(analyzeVulnerability({ vulnerabilityId, projectId }));
    } catch (err) {
      // Error is handled by the Redux state
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Security Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Code Analysis" />
          <Tab label="Code Generation" />
          <Tab label="Improvements" />
          <Tab label="Vulnerability Analysis" />
          <Tab label="Security Patterns" />
          <Tab label="Model Config" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Code Analysis
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your Solana program code here..."
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading || !code}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Code'}
            </Button>

            {currentAnalysis && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <List>
                  {currentAnalysis.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={suggestion.explanation}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Confidence: {suggestion.confidence}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.primary">
                              Impact: {suggestion.impact}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Risk Assessment
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`Overall Risk: ${currentAnalysis.riskAssessment.overallRisk}`}
                    color={currentAnalysis.riskAssessment.overallRisk > 0.7 ? 'error' : 'warning'}
                  />
                </Box>
                <List>
                  {currentAnalysis.riskAssessment.mitigationSuggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generate Secure Code
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe your requirements..."
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || !requirements}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Code'}
            </Button>

            {generatedCode && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Generated Code
                </Typography>
                <CodeBlock code={generatedCode.code} language="rust" />
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Explanation
                </Typography>
                <Typography variant="body1" paragraph>
                  {generatedCode.explanation}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Security Features
                </Typography>
                <List>
                  {generatedCode.securityFeatures.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Suggest Improvements
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code for improvement suggestions..."
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSuggest}
              disabled={loading || !code}
            >
              {loading ? <CircularProgress size={24} /> : 'Suggest Improvements'}
            </Button>

            {currentAnalysis && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Suggested Improvements
                </Typography>
                <List>
                  {currentAnalysis.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={suggestion.explanation}
                        secondary={
                          <>
                            <CodeBlock
                              code={suggestion.originalCode}
                              language="rust"
                              title="Original Code"
                            />
                            <CodeBlock
                              code={suggestion.suggestedCode}
                              language="rust"
                              title="Suggested Code"
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vulnerability Analysis
            </Typography>
            <TextField
              fullWidth
              value={vulnerabilityId}
              onChange={(e) => setVulnerabilityId(e.target.value)}
              placeholder="Enter vulnerability ID..."
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAnalyzeVulnerability}
              disabled={loading || !vulnerabilityId}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Vulnerability'}
            </Button>

            {vulnerabilityAnalysis && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Vulnerability Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Severity"
                      secondary={
                        <Chip
                          label={vulnerabilityAnalysis.severity}
                          color={
                            vulnerabilityAnalysis.severity === 'High'
                              ? 'error'
                              : vulnerabilityAnalysis.severity === 'Medium'
                              ? 'warning'
                              : 'info'
                          }
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Description"
                      secondary={vulnerabilityAnalysis.description}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Suggested Fix"
                      secondary={
                        <CodeBlock
                          code={vulnerabilityAnalysis.suggestedFix}
                          language="rust"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Security Patterns
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {securityPatterns.map((pattern, index) => (
              <SecurityPatternCard key={index} pattern={pattern} />
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 5 && (
        <ModelConfigPanel configs={modelConfigs} />
      )}
    </Box>
  );
}; 