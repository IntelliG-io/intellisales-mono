'use client'

import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Button from './Button'

export type ProductFiltersProps = {
  search: string
  setSearch: (v: string) => void
  category: string
  setCategory: (v: string) => void
  categories: string[]
  onRetry?: () => void
}

export default function ProductFilters({ search, setSearch, category, setCategory, categories, onRetry }: ProductFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="product-search" className="mb-1 block text-sm font-medium text-gray-700">
          Search products
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            id="product-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            aria-label="Search products by name"
          />
        </div>
      </div>

      <div className="w-full sm:w-60">
        <label htmlFor="product-category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="product-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {onRetry && (
        <div className="sm:self-stretch">
          <label className="mb-1 block text-sm font-medium text-transparent">Retry</label>
          <Button variant="secondary" onClick={onRetry} className="w-full">
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
