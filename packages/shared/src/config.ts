// API configuration

export const API_BASE_URL = 'http://localhost:3001';

export const API_ENDPOINTS = {
  health: '/health',
  status: '/api/status',
  patientData: '/api/preVisit/getPatientData',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
