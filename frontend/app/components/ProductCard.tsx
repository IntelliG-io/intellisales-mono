'use client'

import React from 'react'
import { twMerge } from 'tailwind-merge'

export type ProductCardProps = {
  id: string
  name: string
  price: string | number
  category: string
  status: 'active' | 'inactive'
  currency?: string
  className?: string
}

function formatCurrency(value: string | number, currency = 'USD') {
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return value
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num)
  } catch {
    return `$${num.toFixed(2)}`
  }
}

export default function ProductCard({ id, name, price, category, status, currency = 'USD', className }: ProductCardProps) {
  const isActive = status === 'active'
  return (
    <div
      className={twMerge(
        'rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900',
        className
      )}
      role="article"
      aria-labelledby={`product-${id}-name`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 id={`product-${id}-name`} className="text-base font-semibold text-gray-900">
          {name}
        </h3>
        <span
          className={twMerge(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            isActive ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-100 text-gray-700 ring-1 ring-gray-400/20'
          )}
          aria-label={`status: ${status}`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-500">{category}</div>
      <div className="mt-3 text-lg font-semibold text-gray-900">{formatCurrency(price, currency)}</div>
    </div>
  )
}
