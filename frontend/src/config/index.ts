export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  ANALYSIS: {
    ANALYZE: '/analysis/analyze',
    GET: (id: string) => `/analysis/${id}`,
    LIST: (projectId: string) => `/analysis/project/${projectId}`,
  },
  AI: {
    ANALYZE: '/ai/analyze',
    GENERATE: '/ai/generate',
    SUGGEST: '/ai/suggest',
    ANALYZE_VULNERABILITY: '/ai/analyze-vulnerability',
    PATTERNS: '/ai/patterns',
    MODEL_CONFIGS: '/ai/model-configs',
  },
};

export const TOKEN_KEY = 'solguard_token';

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  REGISTER: 'Successfully registered.',
  LOGOUT: 'Successfully logged out.',
  PROJECT_CREATED: 'Project created successfully.',
  PROJECT_UPDATED: 'Project updated successfully.',
  PROJECT_DELETED: 'Project deleted successfully.',
  ANALYSIS_STARTED: 'Analysis started successfully.',
  CODE_GENERATED: 'Code generated successfully.',
  IMPROVEMENTS_SUGGESTED: 'Improvements suggested successfully.',
}; 