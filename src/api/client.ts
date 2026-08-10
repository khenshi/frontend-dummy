import axios from 'axios'

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { Accept: 'application/json' },
})

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Unable to reach the server. Check that the API is running.'
        : error.message)
    )
  }
  return 'Something went wrong. Please try again.'
}
