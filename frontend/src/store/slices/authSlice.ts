import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type User = {
  id: string
  email: string
  name?: string | null
  roles?: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
      state.loading = false
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { login, logout, updateUser, setLoading, setError } = authSlice.actions
export default authSlice.reducer
