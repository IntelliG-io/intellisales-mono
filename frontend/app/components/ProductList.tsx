'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ProductCard from './ProductCard'
import ProductFilters from './ProductFilters'
import Button from './Button'
import { AlertTriangle, FolderOpen } from 'lucide-react'
import { fetchProducts, Product, ProductsResponse } from '../../lib/api/products'

const PAGE_SIZE = 12

function sanitize(text: string) {
  return text.trim().toLowerCase()
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    const set = new Set<string>(['All'])
    for (const p of products) set.add(p.category)
    return Array.from(set)
  }, [products])

  async function load(pageToLoad: number) {
    setLoading(true)
    setError(null)
    try {
      const resp: ProductsResponse = await fetchProducts({ page: pageToLoad, limit: PAGE_SIZE })
      const activeOnly = resp.data.filter((p) => p.status === 'active')
      setProducts((prev) => (pageToLoad === 1 ? activeOnly : [...prev, ...activeOnly]))
      setPage(resp.page)
      setTotalPages(resp.totalPages)
    } catch (_err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const s = sanitize(search)
    return products.filter((p) => {
      const matchesSearch = s ? p.name.toLowerCase().includes(s) : true
      const matchesCategory = category === 'All' ? true : p.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  const canLoadMore = page < totalPages

  return (
    <section className="w-full">
      <div className="mb-4">
        <ProductFilters search={search} setSearch={setSearch} category={category} setCategory={setCategory} categories={categories} />
      </div>

      {loading && products.length === 0 && (
        <div className="flex h-40 items-center justify-center" role="status" aria-live="polite">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <span className="sr-only">Loading</span>
        </div>
      )}

      {error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <AlertTriangle className="h-10 w-10" aria-hidden="true" />
          <p className="text-sm">Failed to load products</p>
          <Button onClick={() => load(1)}>Retry</Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
          <FolderOpen className="h-10 w-10" aria-hidden="true" />
          <p className="text-sm">No products available</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="region" aria-label="products grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} category={p.category} status={p.status} />
        ))}
      </div>

      {canLoadMore && (
        <div className="mt-6 flex justify-center">
          <Button onClick={() => load(page + 1)} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </section>
  )
}
