/**
 * Cart persistence and cross-tab synchronization utilities
 */

import type { CartState, CartPersistenceData, CartSyncEvent } from '../types/cart'

const CART_STORAGE_KEY = 'intellisales_cart'
const CART_SYNC_KEY = 'intellisales_cart_sync'
const CART_VERSION = '1.0.0'

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.localStorage !== null
  } catch {
    return false
  }
}

// Serialize cart state for storage
const serializeCartState = (cartState: CartState): string => {
  const persistenceData: CartPersistenceData = {
    cartState: {
      ...cartState,
      // Convert Date objects to ISO strings for JSON serialization
      createdAt: new Date(cartState.createdAt),
      updatedAt: new Date(),
      items: cartState.items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt),
        modifiedAt: new Date()
      }))
    },
    timestamp: Date.now(),
    version: CART_VERSION
  }
  
  return JSON.stringify(persistenceData)
}

// Deserialize cart state from storage
const deserializeCartState = (data: string): CartState | null => {
  try {
    const persistenceData: CartPersistenceData = JSON.parse(data)
    
    // Check version compatibility (add migration logic here if needed)
    if (persistenceData.version !== CART_VERSION) {
      console.warn('Cart data version mismatch, clearing cart')
      return null
    }
    
    // Convert ISO strings back to Date objects
    const cartState = {
      ...persistenceData.cartState,
      createdAt: new Date(persistenceData.cartState.createdAt),
      updatedAt: new Date(persistenceData.cartState.updatedAt),
      items: persistenceData.cartState.items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt),
        modifiedAt: new Date(item.modifiedAt)
      }))
    }
    
    return cartState
  } catch (error) {
    console.error('Failed to deserialize cart state:', error)
    return null
  }
}

// Save cart to localStorage
export const saveCartToStorage = (cartState: CartState): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cart will not be persisted')
    return false
  }
  
  try {
    const serializedCart = serializeCartState(cartState)
    localStorage.setItem(CART_STORAGE_KEY, serializedCart)
    return true
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error)
    return false
  }
}

// Load cart from localStorage
export const loadCartFromStorage = (): CartState | null => {
  if (!isLocalStorageAvailable()) {
    return null
  }
  
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (!storedCart) {
      return null
    }
    
    return deserializeCartState(storedCart)
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
    clearCartFromStorage() // Clear corrupted data
    return null
  }
}

// Clear cart from localStorage
export const clearCartFromStorage = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false
  }
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error)
    return false
  }
}

// Cross-tab synchronization using localStorage events
let syncEventListeners: ((event: CartSyncEvent) => void)[] = []

// Broadcast cart sync event to other tabs
export const broadcastCartSync = (event: Omit<CartSyncEvent, 'timestamp'>): void => {
  if (!isLocalStorageAvailable()) return
  
  try {
    const syncEvent: CartSyncEvent = {
      ...event,
      timestamp: Date.now()
    }
    
    // Use a temporary key to trigger storage event in other tabs
    const tempKey = `${CART_SYNC_KEY}_${Date.now()}`
    localStorage.setItem(tempKey, JSON.stringify(syncEvent))
    localStorage.removeItem(tempKey) // Clean up immediately
  } catch (error) {
    console.error('Failed to broadcast cart sync event:', error)
  }
}

// Listen for cart sync events from other tabs
export const addCartSyncListener = (listener: (event: CartSyncEvent) => void): void => {
  if (!isLocalStorageAvailable()) return
  
  syncEventListeners.push(listener)
  
  // Add storage event listener if it's the first listener
  if (syncEventListeners.length === 1) {
    window.addEventListener('storage', handleStorageEvent)
  }
}

// Remove cart sync event listener
export const removeCartSyncListener = (listener: (event: CartSyncEvent) => void): void => {
  syncEventListeners = syncEventListeners.filter(l => l !== listener)
  
  // Remove storage event listener if no more listeners
  if (syncEventListeners.length === 0) {
    window.removeEventListener('storage', handleStorageEvent)
  }
}

// Handle localStorage storage events for cross-tab sync
const handleStorageEvent = (e: StorageEvent): void => {
  // Only handle our sync events
  if (!e.key?.startsWith(CART_SYNC_KEY)) return
  
  try {
    if (e.newValue) {
      const syncEvent: CartSyncEvent = JSON.parse(e.newValue)
      
      // Notify all listeners
      syncEventListeners.forEach(listener => {
        try {
          listener(syncEvent)
        } catch (error) {
          console.error('Error in cart sync listener:', error)
        }
      })
    }
  } catch (error) {
    console.error('Failed to handle storage event:', error)
  }
}

// Check if stored cart is expired (older than specified minutes)
export const isCartExpired = (cartState: CartState, expirationMinutes: number = 1440): boolean => {
  const now = new Date().getTime()
  const cartTime = new Date(cartState.updatedAt).getTime()
  const diffMinutes = (now - cartTime) / (1000 * 60)
  
  return diffMinutes > expirationMinutes
}

// Migration utility for handling cart schema changes
export const migrateCartState = (oldState: any, fromVersion: string, toVersion: string): CartState | null => {
  // Add migration logic here when schema changes
  // For now, just return null to force a fresh cart
  if (fromVersion !== toVersion) {
    console.warn(`Cart schema migration from ${fromVersion} to ${toVersion} not supported`)
    return null
  }
  
  return oldState
}

// Utility to merge cart states (useful for conflict resolution)
export const mergeCartStates = (local: CartState, remote: CartState): CartState => {
  // Simple merge strategy: take the most recently updated cart
  // In a more sophisticated implementation, you might merge items
  const localTime = new Date(local.updatedAt).getTime()
  const remoteTime = new Date(remote.updatedAt).getTime()
  
  return remoteTime > localTime ? remote : local
}

// Create a minimal cart state for initialization
export const createEmptyCart = (storeId?: string, cashierId?: string): CartState => {
  const now = new Date()
  
  return {
    items: [],
    customer: null,
    appliedDiscounts: [],
    taxConfig: null,
    defaultTaxRate: 0.08, // 8% default tax rate
    paymentMethods: [],
    totals: {
      subtotal: 0,
      totalDiscount: 0,
      subtotalAfterDiscount: 0,
      totalTax: 0,
      grandTotal: 0,
      itemCount: 0,
      uniqueItemCount: 0
    },
    cartId: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    storeId: storeId || null,
    cashierId: cashierId || null,
    isLoading: false,
    error: null,
    isDirty: false,
    createdAt: now,
    updatedAt: now,
    settings: {
      autoCalculateTax: true,
      allowBackorder: false,
      roundingPrecision: 2,
      taxIncluded: false
    }
  }
}

// Validate cart state integrity
export const validateCartState = (cartState: any): cartState is CartState => {
  try {
    // Basic type checking
    if (!cartState || typeof cartState !== 'object') return false
    if (!Array.isArray(cartState.items)) return false
    if (!cartState.cartId || typeof cartState.cartId !== 'string') return false
    if (!cartState.totals || typeof cartState.totals !== 'object') return false
    
    // Check required fields exist
    const requiredFields = ['createdAt', 'updatedAt', 'settings']
    for (const field of requiredFields) {
      if (!(field in cartState)) return false
    }
    
    return true
  } catch {
    return false
  }
}