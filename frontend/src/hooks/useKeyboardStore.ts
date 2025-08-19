import { create } from 'zustand'

interface KeyboardState {
  previousPath: string | null
  currentPath: string | null
  lastFocusedSelector: string | null
  setPaths: (prev: string | null, curr: string) => void
  setLastFocused: (selector: string | null) => void
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  previousPath: null,
  currentPath: null,
  lastFocusedSelector: null,
  setPaths: (prev, curr) => set({ previousPath: prev, currentPath: curr }),
  setLastFocused: (selector) => set({ lastFocusedSelector: selector }),
}))
