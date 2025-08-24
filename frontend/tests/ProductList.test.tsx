import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ProductList from '../app/components/ProductList'

jest.mock('../lib/api/products', () => {
  return {
    __esModule: true,
    fetchProducts: jest.fn(),
  }
})

import { fetchProducts } from '../lib/api/products'

const makeProducts = () => [
  { id: '1', name: 'Apple', price: '1.50', category: 'Fruit', status: 'active' },
  { id: '2', name: 'Banana', price: '2.00', category: 'Fruit', status: 'active' },
  { id: '3', name: 'Carrot', price: '3.25', category: 'Veg', status: 'inactive' },
  { id: '4', name: 'Apricot', price: '2.75', category: 'Fruit', status: 'active' },
]

describe('ProductList', () => {
  beforeEach(() => {
    ;(fetchProducts as jest.Mock).mockReset()
  })

  test('shows loading then renders products', async () => {
    ;(fetchProducts as jest.Mock).mockResolvedValue({ data: makeProducts(), page: 1, limit: 12, total: 3, totalPages: 1 })
    render(<ProductList />)

    expect(screen.getByRole('status')).toBeInTheDocument()

    expect(await screen.findByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Apricot')).toBeInTheDocument()
    // inactive should be filtered out client-side
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument()
  })

  test('error state with retry', async () => {
    ;(fetchProducts as jest.Mock)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ data: makeProducts(), page: 1, limit: 12, total: 3, totalPages: 1 })

    render(<ProductList />)

    expect(await screen.findByText('Unable to load products')).toBeInTheDocument()

    const retry = screen.getByRole('button', { name: /try again/i })
    await userEvent.click(retry)

    expect(await screen.findByText('Apple')).toBeInTheDocument()
  })

  test('empty state when API returns empty array', async () => {
    ;(fetchProducts as jest.Mock).mockResolvedValue({ data: [], page: 1, limit: 12, total: 0, totalPages: 1 })
    render(<ProductList />)

    expect(await screen.findByText('No products available')).toBeInTheDocument()
  })

  test('search filters by name (case-insensitive, trimmed)', async () => {
    ;(fetchProducts as jest.Mock).mockResolvedValue({ data: makeProducts(), page: 1, limit: 12, total: 3, totalPages: 1 })
    render(<ProductList />)
    await screen.findByText('Apple')

    const input = screen.getByLabelText(/search products/i)
    await userEvent.type(input, ' ap ')

    // Wait for debounce
    await waitFor(() => {
      expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    }, { timeout: 1000 })
    
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Apricot')).toBeInTheDocument()
  })

  test('category dropdown filters', async () => {
    ;(fetchProducts as jest.Mock).mockResolvedValue({ data: makeProducts(), page: 1, limit: 12, total: 3, totalPages: 1 })
    render(<ProductList />)
    await screen.findByText('Apple')

    const select = screen.getByLabelText(/category/i)
    await userEvent.selectOptions(select, 'Fruit')

    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Apricot')).toBeInTheDocument()
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument()
  })

  test('search and category work together', async () => {
    ;(fetchProducts as jest.Mock).mockResolvedValue({ data: makeProducts(), page: 1, limit: 12, total: 3, totalPages: 1 })
    render(<ProductList />)
    await screen.findByText('Apple')

    await userEvent.type(screen.getByLabelText(/search products/i), 'ap')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Fruit')

    // Wait for debounce and filtering
    await waitFor(() => {
      expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Apricot')).toBeInTheDocument()
  })

  test('responsive grid has correct classes', async () => {
    ;(fetchProducts as jest.Mock).mockResolvedValue({ data: makeProducts(), page: 1, limit: 12, total: 3, totalPages: 1 })
    render(<ProductList />)
    const grid = await screen.findByRole('region', { name: 'Products grid' })
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', '2xl:grid-cols-6')
  })
})
