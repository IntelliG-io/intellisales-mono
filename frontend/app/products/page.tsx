import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import Button from '../components/Button'
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and search the available products. Use filters to find specific items quickly.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/products/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
        <ProductList />
      </main>
    </RouteGuard>
  )
}
