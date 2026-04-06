// API configuration

export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  health: '/health',
  status: '/api/status',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
