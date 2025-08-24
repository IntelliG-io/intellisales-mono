import React from 'react'

import ProductList from '../components/ProductList'
import RouteGuard from '../components/RouteGuard'

export const metadata = {
  title: 'Products - IntelliSales POS',
  description: 'Browse and search available products in the POS system',
}

export default function ProductsPage() {
  return (
    <RouteGuard>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and search the available products. Use filters to find specific items quickly.
          </p>
        </div>
        <ProductList />
      </main>
    </RouteGuard>
  )
}
