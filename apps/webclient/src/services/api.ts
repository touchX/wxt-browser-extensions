import { API_BASE_URL, API_ENDPOINTS } from '@wxt-ext/shared'

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  },

  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }
}

// Export specific API methods
export const healthApi = () => apiClient.get(API_ENDPOINTS.health)
export const statusApi = () => apiClient.get(API_ENDPOINTS.status)
