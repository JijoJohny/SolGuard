import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiService, AnalysisResult, GeneratedCode, VulnerabilityAnalysis } from '../../services/aiService';

interface AIState {
  analysisResults: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  generatedCode: GeneratedCode | null;
  vulnerabilityAnalysis: VulnerabilityAnalysis | null;
  securityPatterns: Array<{
    name: string;
    description: string;
    examples: string[];
    implementationGuide: string;
  }>;
  modelConfigs: Record<string, any>;
  loading: boolean;
  error: string | null;
}

const initialState: AIState = {
  analysisResults: [],
  currentAnalysis: null,
  generatedCode: null,
  vulnerabilityAnalysis: null,
  securityPatterns: [],
  modelConfigs: {},
  loading: false,
  error: null,
};

export const analyzeCode = createAsyncThunk(
  'ai/analyzeCode',
  async ({ code, projectId }: { code: string; projectId: string }) => {
    return await aiService.analyzeCode(code, projectId);
  }
);

export const generateCode = createAsyncThunk(
  'ai/generateCode',
  async ({ requirements, projectId }: { requirements: string; projectId: string }) => {
    return await aiService.generateCode(requirements, projectId);
  }
);

export const suggestImprovements = createAsyncThunk(
  'ai/suggestImprovements',
  async ({ code, projectId }: { code: string; projectId: string }) => {
    return await aiService.suggestImprovements(code, projectId);
  }
);

export const analyzeVulnerability = createAsyncThunk(
  'ai/analyzeVulnerability',
  async ({ vulnerabilityId, projectId }: { vulnerabilityId: string; projectId: string }) => {
    return await aiService.analyzeVulnerability(vulnerabilityId, projectId);
  }
);

export const fetchSecurityPatterns = createAsyncThunk(
  'ai/fetchSecurityPatterns',
  async (projectId: string) => {
    return await aiService.getSecurityPatterns(projectId);
  }
);

export const fetchModelConfigs = createAsyncThunk(
  'ai/fetchModelConfigs',
  async (projectId: string) => {
    return await aiService.getModelConfigs(projectId);
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
    },
    clearGeneratedCode: (state) => {
      state.generatedCode = null;
    },
    clearVulnerabilityAnalysis: (state) => {
      state.vulnerabilityAnalysis = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analyze Code
      .addCase(analyzeCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
        state.analysisResults.push(action.payload);
      })
      .addCase(analyzeCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to analyze code';
      })
      // Generate Code
      .addCase(generateCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCode.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCode = action.payload;
      })
      .addCase(generateCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate code';
      })
      // Suggest Improvements
      .addCase(suggestImprovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(suggestImprovements.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
        state.analysisResults.push(action.payload);
      })
      .addCase(suggestImprovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to suggest improvements';
      })
      // Analyze Vulnerability
      .addCase(analyzeVulnerability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeVulnerability.fulfilled, (state, action) => {
        state.loading = false;
        state.vulnerabilityAnalysis = action.payload;
      })
      .addCase(analyzeVulnerability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to analyze vulnerability';
      })
      // Fetch Security Patterns
      .addCase(fetchSecurityPatterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecurityPatterns.fulfilled, (state, action) => {
        state.loading = false;
        state.securityPatterns = action.payload;
      })
      .addCase(fetchSecurityPatterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch security patterns';
      })
      // Fetch Model Configs
      .addCase(fetchModelConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModelConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.modelConfigs = action.payload;
      })
      .addCase(fetchModelConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch model configurations';
      });
  },
});

export const {
  clearCurrentAnalysis,
  clearGeneratedCode,
  clearVulnerabilityAnalysis,
  clearError,
} = aiSlice.actions;

export default aiSlice.reducer; 