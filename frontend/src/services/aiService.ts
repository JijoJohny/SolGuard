import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface AnalysisResult {
  suggestions: Array<{
    explanation: string;
    confidence: number;
    impact: string;
    originalCode: string;
    suggestedCode: string;
  }>;
  riskAssessment: {
    overallRisk: number;
    riskFactors: Record<string, number>;
    mitigationSuggestions: string[];
  };
  bestPractices: string[];
  securityPatterns: Array<{
    name: string;
    description: string;
    examples: string[];
    implementationGuide: string;
  }>;
}

export interface GeneratedCode {
  code: string;
  explanation: string;
  securityFeatures: string[];
  bestPractices: string[];
}

export interface VulnerabilityAnalysis {
  vulnerabilityId: string;
  severity: string;
  description: string;
  suggestedFix: string;
  confidence: number;
  affectedCode: string;
  fixedCode: string;
}

class AIService {
  private baseUrl = `${API_BASE_URL}/ai`;

  async analyzeCode(code: string, projectId: string): Promise<AnalysisResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze`, {
        code,
        project_id: projectId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateCode(requirements: string, projectId: string): Promise<GeneratedCode> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, {
        requirements,
        project_id: projectId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suggestImprovements(code: string, projectId: string): Promise<AnalysisResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/suggest`, {
        code,
        project_id: projectId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async analyzeVulnerability(vulnerabilityId: string, projectId: string): Promise<VulnerabilityAnalysis> {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze-vulnerability`, {
        vulnerability_id: vulnerabilityId,
        project_id: projectId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSecurityPatterns(projectId: string): Promise<Array<{
    name: string;
    description: string;
    examples: string[];
    implementationGuide: string;
  }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/patterns`, {
        params: { project_id: projectId },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getModelConfigs(projectId: string): Promise<Record<string, any>> {
    try {
      const response = await axios.get(`${this.baseUrl}/model-configs`, {
        params: { project_id: projectId },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error;
  }
}

export const aiService = new AIService(); 