import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

import { UserStore } from '../../types/store'

export interface StoreState {
  currentStore: UserStore | null
  availableStores: UserStore[]
  loading: boolean
  error: string | null
  initialized: boolean
}

const STORE_STORAGE_KEY = 'intellisales_current_store'

// Helper functions for localStorage
const saveStoreToStorage = (store: UserStore | null) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (store) {
        localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(store))
      } else {
        localStorage.removeItem(STORE_STORAGE_KEY)
      }
    }
  } catch (error) {
    console.warn('Failed to save store to localStorage:', error)
  }
}

const loadStoreFromStorage = (): UserStore | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORE_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    }
    return null
  } catch (error) {
    console.warn('Failed to load store from localStorage:', error)
    return null
  }
}

const initialState: StoreState = {
  currentStore: null,
  availableStores: [],
  loading: false,
  error: null,
  initialized: false,
}

// Async thunk to fetch user stores
export const fetchUserStores = createAsyncThunk(
  'store/fetchUserStores',
  async (_, { rejectWithValue }) => {
    try {
      // Import here to avoid circular dependency
      const { getUserStores } = await import('../../../api/endpoints/userApi')
      const response = await getUserStores()
      return response.stores
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stores')
    }
  }
)

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    // Set the current store manually
    setCurrentStore(state, action: PayloadAction<UserStore | null>) {
      const store = action.payload
      state.currentStore = store
      state.error = null
      
      // Persist to localStorage
      saveStoreToStorage(store)
    },
    
    // Initialize store from localStorage and available stores
    initializeStore(state, action: PayloadAction<UserStore[]>) {
      const availableStores = action.payload
      state.availableStores = availableStores
      
      // Try to restore from localStorage
      const storedStore = loadStoreFromStorage()
      
      if (storedStore && availableStores.some(s => s.id === storedStore.id)) {
        // Stored store is still valid
        state.currentStore = storedStore
      } else if (availableStores.length > 0) {
        // Default to first available store
        const defaultStore = availableStores[0]
        state.currentStore = defaultStore
        saveStoreToStorage(defaultStore)
      } else {
        state.currentStore = null
        saveStoreToStorage(null)
      }
      
      state.initialized = true
      state.error = null
    },
    
    // Clear store state (on logout)
    clearStoreState(state) {
      state.currentStore = null
      state.availableStores = []
      state.loading = false
      state.error = null
      state.initialized = false
      
      // Clear from localStorage
      saveStoreToStorage(null)
    },
    
    // Set error state
    setStoreError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.loading = false
    },
    
    // Set loading state
    setStoreLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserStores.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserStores.fulfilled, (state, action) => {
        state.loading = false
        state.availableStores = action.payload
        state.error = null
        
        // Initialize current store
        const storedStore = loadStoreFromStorage()
        
        if (storedStore && action.payload.some(s => s.id === storedStore.id)) {
          // Stored store is still valid
          state.currentStore = storedStore
        } else if (action.payload.length > 0) {
          // Default to first available store
          const defaultStore = action.payload[0]
          state.currentStore = defaultStore
          saveStoreToStorage(defaultStore)
        } else {
          state.currentStore = null
          saveStoreToStorage(null)
        }
        
        state.initialized = true
      })
      .addCase(fetchUserStores.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true // Still mark as initialized even on error
      })
  },
})

export const {
  setCurrentStore,
  initializeStore,
  clearStoreState,
  setStoreError,
  setStoreLoading,
} = storeSlice.actions

export default storeSlice.reducer

// Selectors
export const selectCurrentStore = (state: { store: StoreState }) => state.store.currentStore
export const selectAvailableStores = (state: { store: StoreState }) => state.store.availableStores
export const selectStoreLoading = (state: { store: StoreState }) => state.store.loading
export const selectStoreError = (state: { store: StoreState }) => state.store.error
export const selectStoreInitialized = (state: { store: StoreState }) => state.store.initialized
export const selectHasMultipleStores = (state: { store: StoreState }) => state.store.availableStores.length > 1