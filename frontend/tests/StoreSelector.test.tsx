import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StoreSelector from '../src/components/layout/StoreSelector'
import storeReducer from '../src/store/slices/storeSlice'

// Create a test store
const createTestStore = (storeState = {}) => {
  return configureStore({
    reducer: {
      store: storeReducer,
    },
    preloadedState: {
      store: {
        currentStore: null,
        availableStores: [],
        loading: false,
        error: null,
        initialized: false,
        ...storeState,
      },
    },
  })
}

const renderWithStore = (component: React.ReactElement, storeState = {}) => {
  const store = createTestStore(storeState)
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

const mockStores = [
  { id: 'store-1', name: 'Downtown Store', location: 'Downtown' },
  { id: 'store-2', name: 'Mall Store', location: 'Shopping Mall' },
  { id: 'store-3', name: 'Airport Store', location: null },
]

describe('StoreSelector', () => {
  test('shows loading state when loading', () => {
    renderWithStore(<StoreSelector />, {
      loading: true,
      currentStore: null,
      availableStores: [],
    })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('shows no store message when no store selected and no stores available', () => {
    renderWithStore(<StoreSelector />, {
      loading: false,
      currentStore: null,
      availableStores: [],
    })

    expect(screen.getByText('No Store')).toBeInTheDocument()
  })

  test('shows current store name when only one store available', () => {
    renderWithStore(<StoreSelector />, {
      loading: false,
      currentStore: mockStores[0],
      availableStores: [mockStores[0]],
    })

    expect(screen.getByText('Downtown Store')).toBeInTheDocument()
    // Should not show dropdown when only one store
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  test('shows dropdown when multiple stores available', () => {
    renderWithStore(<StoreSelector />, {
      loading: false,
      currentStore: mockStores[0],
      availableStores: mockStores,
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Downtown Store')).toBeInTheDocument()
  })

  test('allows store selection when multiple stores available', async () => {
    const store = createTestStore({
      loading: false,
      currentStore: mockStores[0],
      availableStores: mockStores,
    })

    render(
      <Provider store={store}>
        <StoreSelector />
      </Provider>
    )

    // Open dropdown
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)

    // Should show all store options
    expect(screen.getByText('Mall Store')).toBeInTheDocument()
    expect(screen.getByText('Airport Store')).toBeInTheDocument()

    // Select different store
    await userEvent.click(screen.getByText('Mall Store'))

    // Store should be updated in Redux state
    const state = store.getState()
    expect(state.store.currentStore?.id).toBe('store-2')
    expect(state.store.currentStore?.name).toBe('Mall Store')
  })

  test('shows store with location information', () => {
    renderWithStore(<StoreSelector />, {
      loading: false,
      currentStore: mockStores[0],
      availableStores: mockStores,
    })

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  test('handles disabled state when loading', () => {
    renderWithStore(<StoreSelector />, {
      loading: true,
      currentStore: mockStores[0],
      availableStores: mockStores,
    })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})