import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type UIState = {
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload
    },
  },
})

export const { setTheme } = uiSlice.actions
export default uiSlice.reducer
