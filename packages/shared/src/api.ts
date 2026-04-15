// Shared API client

import { API_BASE_URL, API_ENDPOINTS } from './config';
import type { ApiResponse, HealthStatus, ApiStatus } from './types';

export class ApiClient {
  constructor(private baseUrl: string = API_BASE_URL) {}

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async health(): Promise<ApiResponse<HealthStatus>> {
    return this.get<HealthStatus>(API_ENDPOINTS.health);
  }

  async status(): Promise<ApiResponse<ApiStatus>> {
    return this.get<ApiStatus>(API_ENDPOINTS.status);
  }
}

// Singleton instance
export const api = new ApiClient();
