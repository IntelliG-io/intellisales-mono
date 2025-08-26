"use client"

import { Store } from 'lucide-react'
import React, { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setCurrentStore,
  selectCurrentStore,
  selectAvailableStores,
  selectHasMultipleStores,
  selectStoreLoading,
} from '../../store/slices/storeSlice'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'

export default function StoreSelector({ className }: { className?: string }) {
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

  // Don't show selector if only one store or no stores or loading
  if (!hasMultipleStores || loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className || ''}`}>
        <Store className="h-4 w-4" />
        <span className="truncate">
          {loading ? 'Loading...' : currentStore?.name || 'No Store'}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Store className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={currentStore?.id || ''} 
        onValueChange={handleStoreChange}
        disabled={loading}
      >
        <SelectTrigger className="w-32 sm:w-40 h-8 text-sm">
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Stores</SelectLabel>
            {availableStores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                <div className="flex flex-col">
                  <span>{store.name}</span>
                  {store.location && (
                    <span className="text-xs text-muted-foreground">{store.location}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
