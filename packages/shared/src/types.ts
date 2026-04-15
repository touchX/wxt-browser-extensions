// Shared TypeScript types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
}

export interface ApiStatus {
  version: string;
  timestamp: string;
  uptime: number;
}
