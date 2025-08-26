'use client'

import { AlertTriangle, FolderOpen, RefreshCw } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchProducts, Product, ProductsResponse } from '../../lib/api/products'
import { useAppSelector } from '../../src/store/hooks'
import { selectCurrentStore } from '../../src/store/slices/storeSlice'

import Button from './Button'
import ProductCard from './ProductCard'
import ProductFilters from './ProductFilters'

const PAGE_SIZE = 24

function sanitize(text: string) {
  return text.trim().toLowerCase()
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export default function ProductList() {
  const currentStore = useAppSelector(selectCurrentStore)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    []
  )

  useEffect(() => {
    debouncedSetSearch(search)
  }, [search, debouncedSetSearch])

  const categories = useMemo(() => {
    const set = new Set<string>(['All'])
    for (const p of products) set.add(p.category)
    return Array.from(set).sort()
  }, [products])

  const loadProducts = useCallback(async (pageToLoad: number, isLoadMore = false) => {
    // Don't load if no store selected
    if (!currentStore) {
      setError('Please select a store to view products')
      setLoading(false)
      setLoadingMore(false)
      return
    }

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const params: any = { 
        page: pageToLoad, 
        limit: PAGE_SIZE 
      }
      
      if (debouncedSearch.trim()) {
        params.q = debouncedSearch.trim()
      }
      
      if (category !== 'All') {
        params.category = category
      }

      const resp: ProductsResponse = await fetchProducts(params, currentStore.id)
      const activeOnly = resp.data.filter((p) => p.status === 'active')
      
      setProducts((prev) => (pageToLoad === 1 ? activeOnly : [...prev, ...activeOnly]))
      setPage(resp.page)
      setTotalPages(resp.totalPages)
      setTotal(resp.total)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products'
      setError(message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, category, currentStore])

  useEffect(() => {
    loadProducts(1)
  }, [loadProducts])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim() && category === 'All') {
      return products
    }

    const s = sanitize(debouncedSearch)
    return products.filter((p) => {
      const matchesSearch = s ? p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s) : true
      const matchesCategory = category === 'All' ? true : p.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, debouncedSearch, category])

  const handleRetry = useCallback(() => {
    loadProducts(1)
  }, [loadProducts])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && page < totalPages) {
      loadProducts(page + 1, true)
    }
  }, [loadProducts, loadingMore, page, totalPages])

  const canLoadMore = page < totalPages && !loading && !error
  const showResults = !loading || products.length > 0
  const hasResults = filtered.length > 0
  const showEmptyState = !loading && !error && !hasResults && products.length === 0
  const showNoResults = !loading && !error && !hasResults && products.length > 0

  return (
    <section className="w-full space-y-6">
      <div className="space-y-4">
        <ProductFilters 
          search={search} 
          setSearch={setSearch} 
          category={category} 
          setCategory={setCategory} 
          categories={categories}
          onRetry={error ? handleRetry : undefined}
        />
        
        {showResults && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {hasResults ? (
                <>Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}</>
              ) : (
                'No products found'
              )}
            </span>
            {total > 0 && products.length < total && (
              <span className="text-xs">
                Loaded {products.length} of {total} total products
              </span>
            )}
          </div>
        )}
      </div>

      {loading && products.length === 0 && (
        <div className="flex h-64 items-center justify-center" role="status" aria-live="polite">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
            <p className="text-sm text-gray-600">Loading products...</p>
          </div>
        </div>
      )}

      {error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-900">Unable to load products</h3>
            <p className="text-sm text-red-700 max-w-sm">{error}</p>
          </div>
          <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {showEmptyState && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-gray-400" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">No products available</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              There are currently no products in the system. Products will appear here once they are added.
            </p>
          </div>
          <Button variant="secondary" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {showNoResults && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <FolderOpen className="h-12 w-12 text-gray-400" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">No matching products found</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
              Clear Search
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCategory('All')}>
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {hasResults && (
        <>
          <div 
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
            role="region" 
            aria-label="Products grid"
          >
            {filtered.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id} 
                name={product.name} 
                price={product.price} 
                category={product.category} 
                status={product.status}
                className="transform transition-transform duration-200 hover:scale-105"
              />
            ))}
          </div>

          {canLoadMore && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                variant="secondary"
                size="lg"
                className="min-w-[120px]"
              >
                {loadingMore ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-400 border-t-gray-900" />
                    Loading...
                  </>
                ) : (
                  `Load More (${Math.min(PAGE_SIZE, total - products.length)} remaining)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
