import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Vulnerability {
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  title: string;
  description: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  recommendation: string;
}

interface AnalysisReport {
  vulnerabilities: Vulnerability[];
  warnings: any[];
  suggestions: any[];
}

interface AnalysisResult {
  id: string;
  project_id: string;
  file_path: string;
  report: AnalysisReport;
  created_at: string;
}

interface AnalysisState {
  results: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  results: [],
  currentAnalysis: null,
  loading: false,
  error: null,
};

export const runAnalysis = createAsyncThunk(
  'analysis/runAnalysis',
  async ({ projectId, filePath }: { projectId: string; filePath: string }) => {
    const response = await axios.post('/api/analysis/analyze', {
      project_id: projectId,
      file_path: filePath,
    });
    return response.data.data;
  }
);

export const fetchAnalysis = createAsyncThunk(
  'analysis/fetchAnalysis',
  async (analysisId: string) => {
    const response = await axios.get(`/api/analysis/${analysisId}`);
    return response.data.data;
  }
);

export const fetchProjectAnalyses = createAsyncThunk(
  'analysis/fetchProjectAnalyses',
  async (projectId: string) => {
    const response = await axios.get(`/api/analysis/project/${projectId}`);
    return response.data.data;
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Run analysis
      .addCase(runAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
        state.results.unshift(action.payload);
      })
      .addCase(runAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to run analysis';
      })
      // Fetch single analysis
      .addCase(fetchAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(fetchAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analysis';
      })
      // Fetch project analyses
      .addCase(fetchProjectAnalyses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectAnalyses.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchProjectAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project analyses';
      });
  },
});

export const { clearError, clearCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer; 