import axios from 'axios'

// Production (Vercel): use /api proxy — same domain, no CORS issues
// Development: use local PHP backend
const API_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const csrf = localStorage.getItem('csrf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (csrf) config.headers['X-CSRF-Token'] = csrf
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config
  if (error.response?.status === 403 && error.response?.data?.message === 'Invalid CSRF token' && config && !config._csrfRetry) {
      localStorage.removeItem('csrf_token')
      config._csrfRetry = true
      delete config.headers['X-CSRF-Token']
      return api.request(config)
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('csrf_token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_more: boolean
  }
}
