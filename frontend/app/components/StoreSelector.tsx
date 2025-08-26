'use client'

import { ChevronDown, Store, MapPin } from 'lucide-react'
import React, { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '../../src/store/hooks'
import {
  setCurrentStore,
  selectCurrentStore,
  selectAvailableStores,
  selectHasMultipleStores,
  selectStoreLoading,
} from '../../src/store/slices/storeSlice'

export type StoreSelectorProps = {
  className?: string
  showIcon?: boolean
  variant?: 'header' | 'sidebar' | 'compact'
}

export default function StoreSelector({ 
  className = '', 
  showIcon = true, 
  variant = 'header' 
}: StoreSelectorProps) {
  const dispatch = useAppDispatch()
  const currentStore = useAppSelector(selectCurrentStore)
  const availableStores = useAppSelector(selectAvailableStores)
  const hasMultipleStores = useAppSelector(selectHasMultipleStores)
  const loading = useAppSelector(selectStoreLoading)

  const handleStoreChange = useCallback((storeId: string) => {
    const selectedStore = availableStores.find(store => store.id === storeId)
    if (selectedStore) {
      dispatch(setCurrentStore(selectedStore))
    }
  }, [dispatch, availableStores])

  // Don't show selector if only one store or no stores
  if (!hasMultipleStores || loading) {
    if (variant === 'compact') return null
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Store className="h-4 w-4 text-gray-500" />}
        <span className={`${
          variant === 'header' ? 'text-sm font-medium text-gray-900' : 
          variant === 'sidebar' ? 'text-sm text-gray-600' : 
          'text-xs text-gray-500'
        }`}>
          {currentStore?.name || 'No Store Selected'}
        </span>
      </div>
    )
  }

  const baseClasses = variant === 'header' 
    ? 'relative inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    : variant === 'sidebar'
    ? 'relative inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500'
    : 'relative inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 focus:outline-none'

  return (
    <div className={`relative ${className}`}>
      <select
        value={currentStore?.id || ''}
        onChange={(e) => handleStoreChange(e.target.value)}
        className={`${baseClasses} appearance-none pr-8 cursor-pointer min-w-0`}
        disabled={loading}
      >
        {!currentStore && (
          <option value="" disabled>
            Select Store
          </option>
        )}
        {availableStores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
            {store.location && ` • ${store.location}`}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className={`${
          variant === 'header' ? 'h-4 w-4' : 'h-3 w-3'
        } text-gray-400`} />
      </div>
      
      {/* Store icon */}
      {showIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Store className={`${
            variant === 'header' ? 'h-4 w-4' : 'h-3 w-3'
          } text-gray-500`} />
        </div>
      )}
    </div>
  )
}

// Compact version with enhanced dropdown for better UX
export function StoreDropdown({ className = '' }: { className?: string }) {
  const dispatch = useAppDispatch()
  const currentStore = useAppSelector(selectCurrentStore)
  const availableStores = useAppSelector(selectAvailableStores)
  const hasMultipleStores = useAppSelector(selectHasMultipleStores)
  const loading = useAppSelector(selectStoreLoading)

  const handleStoreChange = useCallback((storeId: string) => {
    const selectedStore = availableStores.find(store => store.id === storeId)
    if (selectedStore) {
      dispatch(setCurrentStore(selectedStore))
    }
  }, [dispatch, availableStores])

  if (!hasMultipleStores || loading) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-md ${className}`}>
        <Store className="h-5 w-5 text-gray-500" />
        <div>
          <div className="text-sm font-medium text-gray-900">
            {currentStore?.name || 'No Store Selected'}
          </div>
          {currentStore?.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin className="h-3 w-3" />
              {currentStore.location}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="store-select" className="block text-sm font-medium text-gray-700 mb-2">
        Current Store
      </label>
      <div className="relative">
        <select
          id="store-select"
          value={currentStore?.id || ''}
          onChange={(e) => handleStoreChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 text-base border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
          disabled={loading}
        >
          {!currentStore && (
            <option value="" disabled>
              Select a store
            </option>
          )}
          {availableStores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
              {store.location && ` (${store.location})`}
            </option>
          ))}
        </select>
        
        {/* Store icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Store className="h-5 w-5 text-gray-500" />
        </div>
        
        {/* Dropdown icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Selected store info */}
      {currentStore?.location && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
          <MapPin className="h-4 w-4" />
          {currentStore.location}
        </div>
      )}
    </div>
  )
}