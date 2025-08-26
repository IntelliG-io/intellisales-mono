/**
 * Advanced cart selectors for complex queries and computed values
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { CartItem, CartDiscount, PaymentMethod } from '../../types/cart'
import { roundMoney, formatMoney, calculateChange, validatePaymentAmounts } from '../../utils/cartCalculations'

// Base selectors
const selectCartState = (state: RootState) => state.cart

// Basic selectors (re-exported from slice)
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
)

export const selectCartTotals = createSelector(
  [selectCartState],
  (cart) => cart.totals
)

export const selectCartCustomer = createSelector(
  [selectCartState],
  (cart) => cart.customer
)

export const selectCartSettings = createSelector(
  [selectCartState],
  (cart) => cart.settings
)

// Advanced selectors

// Get items grouped by category
export const selectCartItemsByCategory = createSelector(
  [selectCartItems],
  (items) => {
    const grouped: Record<string, CartItem[]> = {}
    
    items.forEach(item => {
      const category = item.product.category || 'Uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })
    
    return grouped
  }
)

// Get items with low stock warnings
export const selectLowStockItems = createSelector(
  [selectCartItems],
  (items) => {
    return items.filter(item => {
      const stockLevel = item.product.stockLevel
      return stockLevel !== undefined && stockLevel < item.quantity
    })
  }
)

// Get items that are taxable
export const selectTaxableItems = createSelector(
  [selectCartItems],
  (items) => items.filter(item => item.product.taxable)
)

// Get items with discounts applied
export const selectDiscountedItems = createSelector(
  [selectCartItems],
  (items) => items.filter(item => (item.discountAmount || 0) > 0)
)

// Calculate total savings from discounts
export const selectTotalSavings = createSelector(
  [selectCartTotals, selectCartItems],
  (totals, items) => {
    const itemDiscounts = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
    return roundMoney(itemDiscounts + totals.totalDiscount)
  }
)

// Get formatted totals for display
export const selectFormattedTotals = createSelector(
  [selectCartTotals],
  (totals) => ({
    subtotal: formatMoney(totals.subtotal),
    totalDiscount: formatMoney(totals.totalDiscount),
    subtotalAfterDiscount: formatMoney(totals.subtotalAfterDiscount),
    totalTax: formatMoney(totals.totalTax),
    grandTotal: formatMoney(totals.grandTotal),
    itemCount: totals.itemCount.toString(),
    uniqueItemCount: totals.uniqueItemCount.toString()
  })
)

// Payment-related selectors

export const selectPaymentMethods = createSelector(
  [selectCartState],
  (cart) => cart.paymentMethods
)

export const selectTotalPaid = createSelector(
  [selectPaymentMethods],
  (paymentMethods) => {
    return roundMoney(paymentMethods.reduce((sum, method) => sum + (method.amount || 0), 0))
  }
)

export const selectPaymentValidation = createSelector(
  [selectPaymentMethods, selectCartTotals],
  (paymentMethods, totals) => {
    const amounts = paymentMethods.map(method => method.amount || 0)
    return validatePaymentAmounts(amounts, totals.grandTotal)
  }
)

export const selectChangeToGive = createSelector(
  [selectTotalPaid, selectCartTotals],
  (totalPaid, totals) => calculateChange(totalPaid, totals.grandTotal)
)

export const selectRemainingBalance = createSelector(
  [selectTotalPaid, selectCartTotals],
  (totalPaid, totals) => Math.max(0, roundMoney(totals.grandTotal - totalPaid))
)

// Split payment analysis
export const selectPaymentBreakdown = createSelector(
  [selectPaymentMethods, selectCartTotals],
  (paymentMethods, totals) => {
    const breakdown = paymentMethods.map(method => ({
      ...method,
      percentage: totals.grandTotal > 0 ? (method.amount || 0) / totals.grandTotal * 100 : 0,
      formattedAmount: formatMoney(method.amount || 0)
    }))
    
    return {
      methods: breakdown,
      totalPaid: roundMoney(paymentMethods.reduce((sum, method) => sum + (method.amount || 0), 0)),
      isComplete: validatePaymentAmounts(paymentMethods.map(m => m.amount || 0), totals.grandTotal).isValid,
      change: calculateChange(
        paymentMethods.reduce((sum, method) => sum + (method.amount || 0), 0),
        totals.grandTotal
      )
    }
  }
)

// Discount-related selectors
export const selectAppliedDiscounts = createSelector(
  [selectCartState],
  (cart) => cart.appliedDiscounts
)

export const selectDiscountSummary = createSelector(
  [selectAppliedDiscounts, selectCartItems],
  (discounts, items) => {
    const itemDiscounts = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
    const globalDiscounts = discounts.reduce((sum, discount) => {
      // This would need to be calculated based on discount type and cart totals
      // For now, just return the discount value
      return sum + (discount.type === 'fixed_amount' ? discount.value : 0)
    }, 0)
    
    return {
      itemDiscounts: roundMoney(itemDiscounts),
      globalDiscounts: roundMoney(globalDiscounts),
      totalDiscounts: roundMoney(itemDiscounts + globalDiscounts),
      discountCount: discounts.length + items.filter(item => (item.discountAmount || 0) > 0).length
    }
  }
)

// Cart validation selectors
export const selectCartValidation = createSelector(
  [selectCartItems, selectCartSettings],
  (items, settings) => {
    const issues: string[] = []
    
    // Check for out of stock items
    if (!settings.allowBackorder) {
      items.forEach(item => {
        if (item.product.stockLevel !== undefined && item.quantity > item.product.stockLevel) {
          issues.push(`${item.product.name}: Only ${item.product.stockLevel} available, but ${item.quantity} requested`)
        }
      })
    }
    
    // Check for items exceeding maximum quantity
    items.forEach(item => {
      if (item.product.maxQuantity && item.quantity > item.product.maxQuantity) {
        issues.push(`${item.product.name}: Maximum quantity is ${item.product.maxQuantity}, but ${item.quantity} requested`)
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues,
      canCheckout: issues.length === 0 && items.length > 0
    }
  }
)

// Receipt data selector
export const selectReceiptData = createSelector(
  [selectCartState, selectFormattedTotals, selectPaymentBreakdown],
  (cart, formattedTotals, paymentBreakdown) => {
    return {
      cartId: cart.cartId,
      saleNumber: cart.saleNumber,
      timestamp: cart.updatedAt,
      store: {
        id: cart.storeId,
        name: 'Store Name' // This would come from store state
      },
      cashier: {
        id: cart.cashierId,
        name: 'Cashier Name' // This would come from auth state
      },
      customer: cart.customer,
      items: cart.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: formatMoney(item.unitPrice),
        lineTotal: formatMoney(item.lineTotal),
        discount: item.discountAmount ? formatMoney(item.discountAmount) : null,
        tax: formatMoney(item.taxAmount)
      })),
      totals: formattedTotals,
      payments: paymentBreakdown.methods.map(method => ({
        type: method.name,
        amount: method.formattedAmount
      })),
      appliedDiscounts: cart.appliedDiscounts.map(discount => ({
        name: discount.name,
        type: discount.type,
        value: discount.value
      }))
    }
  }
)

// Search and filter selectors
export const createCartItemsFilter = () => createSelector(
  [selectCartItems, (_: RootState, searchTerm: string) => searchTerm],
  (items, searchTerm) => {
    if (!searchTerm) return items
    
    const term = searchTerm.toLowerCase()
    return items.filter(item => 
      item.product.name.toLowerCase().includes(term) ||
      item.product.category.toLowerCase().includes(term) ||
      (item.product.description && item.product.description.toLowerCase().includes(term))
    )
  }
)

// Performance selectors (memoized for heavy computations)
export const selectCartMetrics = createSelector(
  [selectCartItems, selectCartTotals, selectAppliedDiscounts],
  (items, totals, discounts) => {
    const averageItemValue = items.length > 0 ? totals.subtotal / items.length : 0
    const averageQuantity = items.length > 0 ? totals.itemCount / items.length : 0
    const discountPercentage = totals.subtotal > 0 ? (totals.totalDiscount / totals.subtotal) * 100 : 0
    
    return {
      averageItemValue: roundMoney(averageItemValue),
      averageQuantity: roundMoney(averageQuantity),
      discountPercentage: roundMoney(discountPercentage),
      taxPercentage: totals.subtotalAfterDiscount > 0 ? (totals.totalTax / totals.subtotalAfterDiscount) * 100 : 0,
      itemsWithDiscounts: items.filter(item => (item.discountAmount || 0) > 0).length,
      categoriesCount: new Set(items.map(item => item.product.category)).size
    }
  }
)

// Quick access selectors for UI components
export const selectCartSummary = createSelector(
  [selectCartTotals, selectCartItems, selectCartCustomer, selectCartValidation],
  (totals, items, customer, validation) => ({
    isEmpty: items.length === 0,
    itemCount: totals.itemCount,
    uniqueItemCount: totals.uniqueItemCount,
    grandTotal: formatMoney(totals.grandTotal),
    hasCustomer: !!customer,
    customerName: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : null,
    canCheckout: validation.canCheckout,
    validationIssues: validation.issues
  })
)