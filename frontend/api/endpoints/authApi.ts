import apiClient, { setAuthTokens, clearAuthTokens, ApiError } from '../apiClient'
import { store } from '../../src/store'
import { login as loginAction, logout as logoutAction } from '../../src/store/slices/authSlice'

export type LoginRequest = {
  email: string
  password: string
}

export type Tokens = {
  accessToken: string
  refreshToken?: string
}

export type LoginResponse = {
  user: {
    id: string
    email: string
    name?: string | null
    roles?: string[]
  }
  tokens: Tokens
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', payload)
    if (data?.tokens?.accessToken) {
      setAuthTokens(data.tokens.accessToken, data.tokens.refreshToken)
    }
    store.dispatch(loginAction(data.user))
    return data
  } catch (err) {
    throw err as ApiError
  }
}

export function logout(): void {
  clearAuthTokens()
  store.dispatch(logoutAction())
  if (typeof window !== 'undefined') {
    window.location.assign('/login')
  }
}

export async function me() {
  try {
    const { data } = await apiClient.get('/api/auth/me')
    return data
  } catch (err) {
    throw err as ApiError
  }
}
