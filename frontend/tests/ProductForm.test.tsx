import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ProductForm from '../app/components/ProductForm'
import storeReducer from '../src/store/slices/storeSlice'

// Mock the API
jest.mock('../lib/api/products', () => ({
  createProduct: jest.fn(),
}))

import { createProduct } from '../lib/api/products'
const mockCreateProduct = createProduct as jest.MockedFunction<typeof createProduct>

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      store: storeReducer,
    },
    preloadedState: {
      store: {
        currentStore: { id: 'test-store-id', name: 'Test Store', location: null },
        availableStores: [{ id: 'test-store-id', name: 'Test Store', location: null }],
        loading: false,
        error: null,
        initialized: true,
        ...initialState,
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

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: '19.99',
  category: 'Food & Beverages',
  status: 'active' as const,
  description: 'Test description',
}

describe('ProductForm', () => {
  beforeEach(() => {
    mockCreateProduct.mockReset()
  })

  test('renders form with all required fields', () => {
    renderWithStore(<ProductForm />)

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    
    expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  test('shows validation errors for empty required fields', async () => {
    renderWithStore(<ProductForm />)

    const submitButton = screen.getByRole('button', { name: /create product/i })
    await userEvent.click(submitButton)

    expect(await screen.findByText(/product name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/price is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/category is required/i)).toBeInTheDocument()
  })

  test('validates price format', async () => {
    renderWithStore(<ProductForm />)

    const priceInput = screen.getByLabelText(/price/i)
    const submitButton = screen.getByRole('button', { name: /create product/i })

    // Test invalid price formats
    await userEvent.type(priceInput, 'invalid')
    await userEvent.click(submitButton)
    expect(await screen.findByText(/price must be a valid number/i)).toBeInTheDocument()

    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '-10')
    await userEvent.click(submitButton)
    expect(await screen.findByText(/price must be a valid number/i)).toBeInTheDocument()

    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '10.999')
    await userEvent.click(submitButton)
    expect(await screen.findByText(/price must be a valid number/i)).toBeInTheDocument()
  })

  test('validates name length', async () => {
    renderWithStore(<ProductForm />)

    const nameInput = screen.getByLabelText(/product name/i)
    const submitButton = screen.getByRole('button', { name: /create product/i })

    await userEvent.type(nameInput, 'a')
    await userEvent.click(submitButton)
    expect(await screen.findByText(/product name must be at least 2 characters/i)).toBeInTheDocument()
  })

  test('successfully creates product with valid data', async () => {
    // Add a small delay to simulate API call
    mockCreateProduct.mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(() => resolve(mockProduct), 100))
    )
    
    const onSuccess = jest.fn()
    renderWithStore(<ProductForm onSuccess={onSuccess} />)

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText(/product name/i), 'Test Product')
    await userEvent.type(screen.getByLabelText(/price/i), '19.99')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food & Beverages')
    await userEvent.type(screen.getByLabelText(/description/i), 'Test description')

    const submitButton = screen.getByRole('button', { name: /create product/i })
    await userEvent.click(submitButton)

    // Should show loading state
    expect(screen.getByText(/creating/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/product created successfully/i)).toBeInTheDocument()
    })

    // Should call createProduct with correct data
    expect(mockCreateProduct).toHaveBeenCalledWith({
      name: 'Test Product',
      price: '19.99',
      category: 'Food & Beverages',
      description: 'Test description',
      storeId: 'test-store-id',
    })

    // Should call onSuccess after delay
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockProduct)
    }, { timeout: 3000 })
  })

  test('handles API validation errors', async () => {
    const apiError = {
      status: 400,
      details: {
        fieldErrors: {
          name: ['Name already exists'],
          price: ['Invalid price format'],
        },
      },
    }
    mockCreateProduct.mockRejectedValueOnce(apiError)

    renderWithStore(<ProductForm />)

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText(/product name/i), 'Test Product')
    await userEvent.type(screen.getByLabelText(/price/i), '19.99')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food & Beverages')

    await userEvent.click(screen.getByRole('button', { name: /create product/i }))

    await waitFor(() => {
      expect(screen.getByText('Name already exists')).toBeInTheDocument()
      expect(screen.getByText('Invalid price format')).toBeInTheDocument()
    })
  })

  test('handles duplicate product error', async () => {
    const apiError = {
      status: 409,
      message: 'Product already exists',
    }
    mockCreateProduct.mockRejectedValueOnce(apiError)

    renderWithStore(<ProductForm />)

    await userEvent.type(screen.getByLabelText(/product name/i), 'Existing Product')
    await userEvent.type(screen.getByLabelText(/price/i), '19.99')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food & Beverages')

    await userEvent.click(screen.getByRole('button', { name: /create product/i }))

    await waitFor(() => {
      expect(screen.getByText(/product with this name already exists/i)).toBeInTheDocument()
    })
  })

  test('resets form when reset button is clicked', async () => {
    renderWithStore(<ProductForm />)

    // Fill form
    await userEvent.type(screen.getByLabelText(/product name/i), 'Test Product')
    await userEvent.type(screen.getByLabelText(/price/i), '19.99')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food & Beverages')

    // Reset form
    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    // Form should be empty
    expect(screen.getByLabelText(/product name/i)).toHaveValue('')
    expect(screen.getByLabelText(/price/i)).toHaveValue('')
    expect(screen.getByLabelText(/category/i)).toHaveValue('')
    expect(screen.getByLabelText(/description/i)).toHaveValue('')
  })

  test('calls onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn()
    renderWithStore(<ProductForm onCancel={onCancel} />)

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  test('clears field errors when typing', async () => {
    renderWithStore(<ProductForm />)

    // Submit to trigger validation errors
    await userEvent.click(screen.getByRole('button', { name: /create product/i }))
    expect(await screen.findByText(/product name is required/i)).toBeInTheDocument()

    // Start typing in name field
    await userEvent.type(screen.getByLabelText(/product name/i), 'T')

    // Error should be cleared
    expect(screen.queryByText(/product name is required/i)).not.toBeInTheDocument()
  })

  test('shows character count for description', () => {
    renderWithStore(<ProductForm />)

    expect(screen.getByText('0/1000 characters')).toBeInTheDocument()
  })

  test('updates character count when typing in description', async () => {
    renderWithStore(<ProductForm />)

    await userEvent.type(screen.getByLabelText(/description/i), 'Test')
    expect(screen.getByText('4/1000 characters')).toBeInTheDocument()
  })

  test('shows error when no store is selected', async () => {
    renderWithStore(<ProductForm />, { currentStore: null })

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText(/product name/i), 'Test Product')
    await userEvent.type(screen.getByLabelText(/price/i), '19.99')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food & Beverages')

    await userEvent.click(screen.getByRole('button', { name: /create product/i }))

    expect(await screen.findByText(/please select a store first/i)).toBeInTheDocument()
  })
})