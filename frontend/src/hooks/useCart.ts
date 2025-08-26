/**
 * Custom React hooks for cart operations
 * Provides easy-to-use interface for cart functionality
 */

import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { RootState } from '../store'

// Import cart actions and selectors
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  setCustomer,
  addPaymentMethod,
  removePaymentMethod,
  setTaxConfig,
  updateCartSettings,
  initializeCart,
  saveCart,
  createNewCart,
  handleCartSync
} from '../store/slices/cartSlice'

import {
  selectCartItems,
  selectCartTotals,
  selectCartCustomer,
  selectCartSummary,
  selectCartValidation,
  selectPaymentBreakdown,
  selectFormattedTotals,
  selectReceiptData,
  selectCartMetrics,
  selectAppliedDiscounts,
  selectCartSettings,
  selectCartItemsByCategory,
  selectLowStockItems
} from '../store/selectors/cartSelectors'

// Import cart types
import type {
  CartItem,
  CartProduct,
  CartCustomer,
  CartDiscount,
  PaymentMethod,
  AddToCartPayload,
  UpdateCartItemPayload,
  CartSyncEvent
} from '../types/cart'

import { addCartSyncListener, removeCartSyncListener } from '../utils/cartPersistence'

/**
 * Main cart hook - provides all cart operations and state
 */
export const useCart = () => {
  const dispatch = useAppDispatch()
  
  // Select cart state
  const items = useAppSelector(selectCartItems)
  const totals = useAppSelector(selectCartTotals)
  const customer = useAppSelector(selectCartCustomer)
  const discounts = useAppSelector(selectAppliedDiscounts)
  const settings = useAppSelector(selectCartSettings)
  const summary = useAppSelector(selectCartSummary)
  const validation = useAppSelector(selectCartValidation)
  const formattedTotals = useAppSelector(selectFormattedTotals)
  const paymentBreakdown = useAppSelector(selectPaymentBreakdown)
  const receiptData = useAppSelector(selectReceiptData)
  const metrics = useAppSelector(selectCartMetrics)
  const itemsByCategory = useAppSelector(selectCartItemsByCategory)
  const lowStockItems = useAppSelector(selectLowStockItems)
  
  const cartState = useAppSelector((state: RootState) => state.cart)
  
  // Cart operations
  const operations = {
    // Initialize cart (usually called on app start)
    initialize: useCallback((storeId?: string, cashierId?: string) => {
      dispatch(initializeCart({ storeId, cashierId }))
    }, [dispatch]),
    
    // Add item to cart
    addItem: useCallback((payload: AddToCartPayload) => {
      dispatch(addToCart(payload))
      dispatch(saveCart()) // Auto-save after operations
    }, [dispatch]),
    
    // Update existing cart item
    updateItem: useCallback((payload: UpdateCartItemPayload) => {
      dispatch(updateCartItem(payload))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Remove item from cart
    removeItem: useCallback((itemId: string) => {
      dispatch(removeFromCart({ itemId }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Clear entire cart
    clear: useCallback(() => {
      dispatch(clearCart())
      dispatch(saveCart())
    }, [dispatch]),
    
    // Apply discount
    addDiscount: useCallback((discount: CartDiscount) => {
      dispatch(applyDiscount({ discount }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Remove discount
    removeDiscountById: useCallback((discountId: string) => {
      dispatch(removeDiscount({ discountId }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Set customer
    setCustomerInfo: useCallback((customer: CartCustomer) => {
      dispatch(setCustomer({ customer }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Add payment method
    addPayment: useCallback((paymentMethod: PaymentMethod) => {
      dispatch(addPaymentMethod({ paymentMethod }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Remove payment method
    removePayment: useCallback((paymentMethodId: string) => {
      dispatch(removePaymentMethod({ paymentMethodId }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Update tax configuration
    updateTax: useCallback((taxRate: number) => {
      dispatch(setTaxConfig({ taxRate }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Update cart settings
    updateSettings: useCallback((newSettings: Partial<typeof settings>) => {
      dispatch(updateCartSettings(newSettings))
      dispatch(saveCart())
    }, [dispatch, settings]),
    
    // Create new cart (start fresh)
    createNew: useCallback((storeId?: string, cashierId?: string) => {
      dispatch(createNewCart({ storeId, cashierId }))
      dispatch(saveCart())
    }, [dispatch]),
    
    // Manual save
    save: useCallback(() => {
      dispatch(saveCart())
    }, [dispatch])
  }
  
  // Setup cross-tab synchronization
  useEffect(() => {
    const handleSync = (syncEvent: CartSyncEvent) => {
      dispatch(handleCartSync(syncEvent))
    }
    
    addCartSyncListener(handleSync)
    
    return () => {
      removeCartSyncListener(handleSync)
    }
  }, [dispatch])
  
  return {
    // State
    items,
    totals,
    customer,
    discounts,
    settings,
    summary,
    validation,
    formattedTotals,
    paymentBreakdown,
    receiptData,
    metrics,
    itemsByCategory,
    lowStockItems,
    
    // Computed state
    isEmpty: items.length === 0,
    itemCount: totals.itemCount,
    grandTotal: totals.grandTotal,
    isLoading: cartState.isLoading,
    error: cartState.error,
    isDirty: cartState.isDirty,
    cartId: cartState.cartId,
    
    // Operations
    ...operations
  }
}

/**
 * Simplified cart hook for basic operations
 */
export const useSimpleCart = () => {
  const cart = useCart()
  
  return {
    items: cart.items,
    itemCount: cart.itemCount,
    grandTotal: cart.grandTotal,
    isEmpty: cart.isEmpty,
    
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    clear: cart.clear,
    
    formattedTotal: cart.formattedTotals.grandTotal
  }
}

/**
 * Cart item management hook
 */
export const useCartItem = (itemId?: string) => {
  const cart = useCart()
  
  const item = itemId ? cart.items.find(item => item.id === itemId) : null
  
  const updateQuantity = useCallback((quantity: number) => {
    if (!itemId) return
    cart.updateItem({ itemId, quantity })
  }, [cart, itemId])
  
  const updatePrice = useCallback((unitPrice: number) => {
    if (!itemId) return
    cart.updateItem({ itemId, unitPrice })
  }, [cart, itemId])
  
  const applyDiscount = useCallback((discountType: 'percentage' | 'fixed_amount', discountValue: number) => {
    if (!itemId) return
    cart.updateItem({ itemId, discountType, discountValue })
  }, [cart, itemId])
  
  const remove = useCallback(() => {
    if (!itemId) return
    cart.removeItem(itemId)
  }, [cart, itemId])
  
  return {
    item,
    updateQuantity,
    updatePrice,
    applyDiscount,
    remove,
    exists: !!item
  }
}

/**
 * Cart validation hook
 */
export const useCartValidation = () => {
  const validation = useAppSelector(selectCartValidation)
  const paymentBreakdown = useAppSelector(selectPaymentBreakdown)
  
  return {
    ...validation,
    paymentComplete: paymentBreakdown.isComplete,
    readyForCheckout: validation.canCheckout && paymentBreakdown.isComplete,
    warnings: [
      ...validation.issues,
      ...(paymentBreakdown.isComplete ? [] : ['Payment incomplete'])
    ]
  }
}

/**
 * Cart analytics hook
 */
export const useCartAnalytics = () => {
  const metrics = useAppSelector(selectCartMetrics)
  const totals = useAppSelector(selectCartTotals)
  const items = useAppSelector(selectCartItems)
  
  const categoryBreakdown = useAppSelector(selectCartItemsByCategory)
  
  return {
    metrics,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([category, items]) => ({
      category,
      itemCount: items.length,
      totalValue: items.reduce((sum, item) => sum + item.lineTotal, 0),
      percentage: totals.subtotal > 0 ? (items.reduce((sum, item) => sum + item.lineTotal, 0) / totals.subtotal) * 100 : 0
    })),
    topItems: [...items]
      .sort((a, b) => b.lineTotal - a.lineTotal)
      .slice(0, 5)
      .map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        percentage: totals.subtotal > 0 ? (item.lineTotal / totals.subtotal) * 100 : 0
      }))
  }
}

/**
 * Cart persistence hook - handles auto-save and sync
 */
export const useCartPersistence = () => {
  const cart = useCart()
  
  // Auto-save when cart becomes dirty
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    if (cart.isDirty) {
      timeoutId = setTimeout(() => {
        cart.save()
      }, 1000) // Debounce saves by 1 second
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [cart.isDirty, cart.save])
  
  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cart.isDirty) {
        cart.save()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [cart.isDirty, cart.save])
  
  return {
    isDirty: cart.isDirty,
    save: cart.save,
    autoSaveEnabled: true // Could be configurable
  }
}

/**
 * Hook for managing product search within cart
 */
export const useCartSearch = (searchTerm: string) => {
  const allItems = useAppSelector(selectCartItems)
  
  const filteredItems = allItems.filter(item => {
    if (!searchTerm) return true
    
    const term = searchTerm.toLowerCase()
    return (
      item.product.name.toLowerCase().includes(term) ||
      item.product.category.toLowerCase().includes(term) ||
      (item.product.description && item.product.description.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    )
  })
  
  return {
    items: filteredItems,
    totalItems: allItems.length,
    filteredCount: filteredItems.length,
    hasResults: filteredItems.length > 0,
    noResults: searchTerm && filteredItems.length === 0
  }
}