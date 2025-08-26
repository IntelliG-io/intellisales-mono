import { useRouter } from 'next/navigation'
import React from 'react'

import ProductForm from '../../components/ProductForm'
import RouteGuard from '../../components/RouteGuard'

export const metadata = {
  title: 'Add New Product - IntelliSales POS',
  description: 'Add a new product to your store inventory',
}

export default function NewProductPage() {
  return (
    <RouteGuard>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new product for your store inventory. All fields marked with * are required.
          </p>
        </div>
        
        <ProductForm 
          onSuccess={(product) => {
            console.log('Product created:', product)
            // TODO: Add navigation to products list or show success toast
            // router.push('/products')
          }}
          onCancel={() => {
            // TODO: Add navigation back to products list
            // router.back()
          }}
        />
      </main>
    </RouteGuard>
  )
}