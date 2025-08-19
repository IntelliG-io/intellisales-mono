import React from 'react'
import ProductList from '../components/ProductList'

export const metadata = {
  title: 'Products',
}

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-600">Browse and search the available products.</p>
      </div>
      <ProductList />
    </main>
  )
}
