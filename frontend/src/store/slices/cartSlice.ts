/**
 * Redux slice for shopping cart management
 * Supports complex POS operations including split payments, discounts, and tax calculations
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

import type {
  CartState,
  CartItem,
  CartCustomer,
  CartDiscount,
  PaymentMethod,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
  ApplyDiscountPayload,
  SetCustomerPayload,
  AddPaymentMethodPayload,
  CartSyncEvent
} from '../../types/cart'

import {
  calculateCartItemTotals,
  calculateCartTotals,
  generateCartItemId,
  generateCartId,
  validateQuantity,
  isSameCartItem,
  roundMoney
} from '../../utils/cartCalculations'

import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartFromStorage,
  createEmptyCart,
  broadcastCartSync,
  addCartSyncListener,
  removeCartSyncListener,
  isCartExpired,
  validateCartState
} from '../../utils/cartPersistence'

// Async thunk for initializing cart from storage
export const initializeCart = createAsyncThunk(
  'cart/initialize',
  async (payload: { storeId?: string; cashierId?: string }) => {
    try {
      const storedCart = loadCartFromStorage()
      
      if (storedCart && validateCartState(storedCart) && !isCartExpired(storedCart)) {
        // Update store and cashier if provided
        const updatedCart = {
          ...storedCart,
          storeId: payload.storeId || storedCart.storeId,
          cashierId: payload.cashierId || storedCart.cashierId,
          updatedAt: new Date()
        }
        
        return updatedCart
      } else {
        // Create new empty cart
        return createEmptyCart(payload.storeId, payload.cashierId)
      }
    } catch (error) {
      console.error('Failed to initialize cart:', error)
      return createEmptyCart(payload.storeId, payload.cashierId)
    }
  }
)

// Async thunk for saving cart to storage
export const saveCart = createAsyncThunk(
  'cart/save',
  async (_, { getState }) => {
    const state = getState() as { cart: CartState }
    const success = saveCartToStorage(state.cart)
    
    if (success) {
      // Broadcast sync event to other tabs
      broadcastCartSync({
        type: 'CART_UPDATED',
        cartId: state.cart.cartId,
        data: { itemCount: state.cart.totals.itemCount }
      })
    }
    
    return success
  }
)

// Initial state
const initialState: CartState = createEmptyCart()

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, quantity = 1, unitPrice, notes } = action.payload
      
      // Validate quantity
      const validation = validateQuantity(quantity, product, state.settings.allowBackorder)
      if (!validation.isValid) {
        state.error = validation.message || 'Invalid quantity'
        return
      }
      
      const finalUnitPrice = unitPrice || product.price
      const taxRate = product.taxRate || state.defaultTaxRate
      
      // Check if we can merge with existing item
      const existingItemIndex = state.items.findIndex(item => 
        item.product.id === product.id && 
        item.unitPrice === finalUnitPrice &&
        item.notes === notes
      )
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex]
        const newQuantity = existingItem.quantity + quantity
        
        // Validate new quantity
        const newValidation = validateQuantity(newQuantity, product, state.settings.allowBackorder)
        if (!newValidation.isValid) {
          state.error = newValidation.message || 'Cannot add more of this item'
          return
        }
        
        // Update the item
        const updatedItem = {
          ...existingItem,
          quantity: newQuantity,
          modifiedAt: new Date()
        }
        
        // Recalculate totals for this item
        const calculatedTotals = calculateCartItemTotals(updatedItem, state.settings.taxIncluded)
        state.items[existingItemIndex] = { ...updatedItem, ...calculatedTotals }
      } else {
        // Create new cart item
        const newItem: CartItem = {
          id: generateCartItemId(product.id),
          product,
          quantity,
          unitPrice: finalUnitPrice,
          lineTotal: 0, // Will be calculated
          discountAmount: 0,
          lineTotalAfterDiscount: 0,
          taxRate,
          taxAmount: 0,
          taxableAmount: 0,
          notes,
          addedAt: new Date(),
          modifiedAt: new Date()
        }
        
        // Calculate totals for the new item
        const calculatedTotals = calculateCartItemTotals(newItem, state.settings.taxIncluded)
        const completeItem = { ...newItem, ...calculatedTotals }
        
        state.items.push(completeItem)
      }
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
      state.error = null
    },
    
    // Update cart item
    updateCartItem: (state, action: PayloadAction<UpdateCartItemPayload>) => {
      const { itemId, quantity, unitPrice, notes, discountType, discountValue } = action.payload
      
      const itemIndex = state.items.findIndex(item => item.id === itemId)
      if (itemIndex === -1) {
        state.error = 'Item not found in cart'
        return
      }
      
      const item = state.items[itemIndex]
      
      // Validate quantity if provided
      if (quantity !== undefined) {
        const validation = validateQuantity(quantity, item.product, state.settings.allowBackorder)
        if (!validation.isValid) {
          state.error = validation.message || 'Invalid quantity'
          return
        }
      }
      
      // Update item properties
      const updatedItem = {
        ...item,
        quantity: quantity !== undefined ? quantity : item.quantity,
        unitPrice: unitPrice !== undefined ? unitPrice : item.unitPrice,
        notes: notes !== undefined ? notes : item.notes,
        discountType: discountType !== undefined ? discountType : item.discountType,
        discountValue: discountValue !== undefined ? discountValue : item.discountValue,
        modifiedAt: new Date()
      }
      
      // Recalculate totals for this item
      const calculatedTotals = calculateCartItemTotals(updatedItem, state.settings.taxIncluded)
      state.items[itemIndex] = { ...updatedItem, ...calculatedTotals }
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
      state.error = null
    },
    
    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<RemoveFromCartPayload>) => {
      const { itemId } = action.payload
      
      const itemIndex = state.items.findIndex(item => item.id === itemId)
      if (itemIndex === -1) {
        state.error = 'Item not found in cart'
        return
      }
      
      state.items.splice(itemIndex, 1)
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
      state.error = null
    },
    
    // Clear all items from cart
    clearCart: (state) => {
      state.items = []
      state.appliedDiscounts = []
      state.paymentMethods = []
      state.customer = null
      state.totals = {
        subtotal: 0,
        totalDiscount: 0,
        subtotalAfterDiscount: 0,
        totalTax: 0,
        grandTotal: 0,
        itemCount: 0,
        uniqueItemCount: 0
      }
      state.updatedAt = new Date()
      state.isDirty = true
      state.error = null
      
      // Broadcast sync event
      broadcastCartSync({
        type: 'CART_CLEARED',
        cartId: state.cartId
      })
    },
    
    // Apply discount to cart
    applyDiscount: (state, action: PayloadAction<ApplyDiscountPayload>) => {
      const { discount } = action.payload
      
      // Check if discount is already applied
      const existingDiscountIndex = state.appliedDiscounts.findIndex(d => d.id === discount.id)
      if (existingDiscountIndex >= 0) {
        state.error = 'Discount already applied'
        return
      }
      
      // Add discount
      state.appliedDiscounts.push(discount)
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
      state.error = null
    },
    
    // Remove discount from cart
    removeDiscount: (state, action: PayloadAction<{ discountId: string }>) => {
      const { discountId } = action.payload
      
      const discountIndex = state.appliedDiscounts.findIndex(d => d.id === discountId)
      if (discountIndex === -1) {
        state.error = 'Discount not found'
        return
      }
      
      state.appliedDiscounts.splice(discountIndex, 1)
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
      state.error = null
    },
    
    // Set customer information
    setCustomer: (state, action: PayloadAction<SetCustomerPayload>) => {
      const { customer } = action.payload
      state.customer = customer
      state.updatedAt = new Date()
      state.isDirty = true
    },
    
    // Add payment method (for split payments)
    addPaymentMethod: (state, action: PayloadAction<AddPaymentMethodPayload>) => {
      const { paymentMethod } = action.payload
      
      // Check if payment method already exists (for same type)
      const existingIndex = state.paymentMethods.findIndex(pm => pm.id === paymentMethod.id)
      if (existingIndex >= 0) {
        state.paymentMethods[existingIndex] = paymentMethod
      } else {
        state.paymentMethods.push(paymentMethod)
      }
      
      state.updatedAt = new Date()
      state.isDirty = true
    },
    
    // Remove payment method
    removePaymentMethod: (state, action: PayloadAction<{ paymentMethodId: string }>) => {
      const { paymentMethodId } = action.payload
      
      const methodIndex = state.paymentMethods.findIndex(pm => pm.id === paymentMethodId)
      if (methodIndex >= 0) {
        state.paymentMethods.splice(methodIndex, 1)
        state.updatedAt = new Date()
        state.isDirty = true
      }
    },
    
    // Set tax configuration
    setTaxConfig: (state, action: PayloadAction<{ taxRate: number }>) => {
      const { taxRate } = action.payload
      state.defaultTaxRate = taxRate
      
      // Update tax rate for all items and recalculate
      state.items = state.items.map(item => {
        const updatedItem = { ...item, taxRate, modifiedAt: new Date() }
        const calculatedTotals = calculateCartItemTotals(updatedItem, state.settings.taxIncluded)
        return { ...updatedItem, ...calculatedTotals }
      })
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
    },
    
    // Update cart settings
    updateCartSettings: (state, action: PayloadAction<Partial<CartState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload }
      
      // If tax inclusion setting changed, recalculate all items
      if ('taxIncluded' in action.payload) {
        state.items = state.items.map(item => {
          const calculatedTotals = calculateCartItemTotals(item, state.settings.taxIncluded)
          return { ...item, ...calculatedTotals }
        })
      }
      
      // Recalculate cart totals
      state.totals = calculateCartTotals(state.items, state.appliedDiscounts, state.settings.taxIncluded)
      state.updatedAt = new Date()
      state.isDirty = true
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // Handle cart sync from other tabs
    handleCartSync: (state, action: PayloadAction<CartSyncEvent>) => {
      const syncEvent = action.payload
      
      // Only process events from other cart instances
      if (syncEvent.cartId === state.cartId) return
      
      switch (syncEvent.type) {
        case 'CART_CLEARED':
          // Another tab cleared their cart, you might want to refresh or notify user
          break
        case 'CART_UPDATED':
          // Another tab updated their cart, could trigger a refresh notification
          break
        // Handle other sync events as needed
      }
    },
    
    // Mark cart as saved (clear dirty flag)
    markAsSaved: (state) => {
      state.isDirty = false
    },
    
    // Create new cart (for starting fresh transaction)
    createNewCart: (state, action: PayloadAction<{ storeId?: string; cashierId?: string }>) => {
      const { storeId, cashierId } = action.payload
      const newCart = createEmptyCart(storeId, cashierId)
      
      // Replace current state with new cart
      Object.assign(state, newCart)
      
      // Clear old cart from storage
      clearCartFromStorage()
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(initializeCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initializeCart.fulfilled, (state, action) => {
        // Replace entire state with initialized cart
        Object.assign(state, action.payload)
        state.isLoading = false
        state.error = null
      })
      .addCase(initializeCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to initialize cart'
        console.error('Cart initialization failed:', action.error)
      })
      .addCase(saveCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.isDirty = false
        }
      })
      .addCase(saveCart.rejected, (state, action) => {
        console.error('Failed to save cart:', action.error)
      })
  }
})

export const {
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
  setLoading,
  setError,
  handleCartSync,
  markAsSaved,
  createNewCart
} = cartSlice.actions

export default cartSlice.reducer

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartTotals = (state: { cart: CartState }) => state.cart.totals
export const selectCartCustomer = (state: { cart: CartState }) => state.cart.customer
export const selectCartDiscounts = (state: { cart: CartState }) => state.cart.appliedDiscounts
export const selectCartPaymentMethods = (state: { cart: CartState }) => state.cart.paymentMethods
export const selectCartSettings = (state: { cart: CartState }) => state.cart.settings
export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading
export const selectCartError = (state: { cart: CartState }) => state.cart.error
export const selectCartIsDirty = (state: { cart: CartState }) => state.cart.isDirty
export const selectCartId = (state: { cart: CartState }) => state.cart.cartId
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.totals.itemCount
export const selectCartIsEmpty = (state: { cart: CartState }) => state.cart.items.length === 0