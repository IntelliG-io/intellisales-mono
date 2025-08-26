import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import storeReducer from './slices/storeSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    store: storeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
