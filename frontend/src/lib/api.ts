import axios, { AxiosError, AxiosInstance } from "axios"

/**
 * API_BASE_URL determines where to send API requests
 * 
 * Production: `/api` (served by Django on same host)
 * Development: Uses Vite proxy (vite.config.ts)
 * 
 * ✅ Never hardcode domain - uses relative paths for portability
 */
const API_BASE_URL = "/api"

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // ✅ 30 second timeout (prevent hanging requests)
})

// ✅ Request interceptor: add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // If 401 (Unauthorized) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        try {
          // Try to refresh token
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          // Update tokens
          localStorage.setItem("access_token", data.access)
          api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`

          // Retry original request
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed: clear tokens and redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/demo/login"
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
