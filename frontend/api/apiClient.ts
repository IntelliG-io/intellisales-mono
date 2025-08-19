import axios, { AxiosError, AxiosHeaders, AxiosInstance } from 'axios'
import { store } from '../src/store'
import { logout, setError } from '../src/store/slices/authSlice'

// Token storage keys
export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'

const isBrowser = typeof window !== 'undefined'

export type ApiError = {
  status?: number
  code?: string
  message: string
  details?: unknown
}

function getBaseURL() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
}

export function getAccessToken(): string | null {
  if (!isBrowser) return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(accessToken: string, refreshToken?: string | null) {
  if (!isBrowser) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearAuthTokens() {
  if (!isBrowser) return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Central Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10_000,
  withCredentials: true, // allow cookie-based auth if configured server-side
})

// Avoid multiple refresh calls at once
let refreshingPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  // Optional refresh implementation; if not available on backend, return null and fallback to logout
  if (!isBrowser) return null
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  if (refreshingPromise) return refreshingPromise

  refreshingPromise = (async () => {
    try {
      const resp = await axios.post(
        `${getBaseURL()}/api/auth/refresh`,
        { refreshToken },
        { withCredentials: true, timeout: 10_000 }
      )
      const newAccess: string | undefined = resp.data?.accessToken || resp.data?.access_token
      const newRefresh: string | undefined = resp.data?.refreshToken || resp.data?.refresh_token
      if (newAccess) {
        setAuthTokens(newAccess, newRefresh ?? null)
        return newAccess
      }
      return null
    } catch {
      return null
    } finally {
      refreshingPromise = null
    }
  })()

  return refreshingPromise
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>
    const status = err.response?.status
    const data = err.response?.data as any
    if (data && typeof data === 'object') {
      const code = data.code || data.error || undefined
      const message = data.message || err.message || 'Request failed'
      const details = data.details || data.errors || undefined
      return { status, code, message, details }
    }
    return { status, message: err.message || 'Network or server error' }
  }
  return { message: 'Unknown error' }
}

function safeRedirectToLogin() {
  if (isBrowser) {
    // Use hard navigation to ensure clean state
    window.location.assign('/login')
  }
}

// Request interceptor: attach Authorization
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    // Never log this header
    if (!config.headers) {
      config.headers = new AxiosHeaders()
    }
    const headers = config.headers as AxiosHeaders
    headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Response interceptor: handle auth errors and normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const err = error as AxiosError
    const originalRequest: any = err.config || {}
    const status = err.response?.status

    if ((status === 401 || status === 403)) {
      // Don't redirect/reload on invalid login attempts so the form can show an inline error
      const reqUrl = (originalRequest?.url ?? '').toString()
      const isLoginRequest = reqUrl.includes('/auth/login')
      if (status === 401 && isLoginRequest) {
        return Promise.reject(toApiError(err))
      }

      // Try refresh once on 401 if refresh token exists
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        const newToken = await refreshAccessToken()
        if (newToken) {
          if (!originalRequest.headers) originalRequest.headers = new AxiosHeaders()
          const headers = originalRequest.headers as AxiosHeaders
          headers.set('Authorization', `Bearer ${newToken}`)
          return apiClient.request(originalRequest)
        }
      }
      // Logout on 401/403
      store.dispatch(logout())
      store.dispatch(setError(status === 401 ? 'Unauthorized' : 'Forbidden'))
      clearAuthTokens()
      safeRedirectToLogin()
    }

    return Promise.reject(toApiError(err))
  }
)

export default apiClient
