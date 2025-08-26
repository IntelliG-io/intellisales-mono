/**
 * Cart calculation utilities for POS operations
 */

import type { CartItem, CartDiscount, TaxConfig, CartTotals } from '../types/cart'

// Utility to round monetary values to specified precision
export const roundMoney = (amount: number, precision: number = 2): number => {
  return Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision)
}

// Calculate discount amount for an item
export const calculateItemDiscount = (
  lineTotal: number,
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number
): number => {
  switch (discountType) {
    case 'percentage':
      return roundMoney(lineTotal * (discountValue / 100))
    case 'fixed_amount':
      return Math.min(discountValue, lineTotal) // Can't discount more than the line total
    default:
      return 0
  }
}

// Calculate tax amount for an item
export const calculateItemTax = (
  taxableAmount: number,
  taxRate: number,
  taxIncluded: boolean = false
): number => {
  if (taxIncluded) {
    // If tax is included in the price, calculate the tax portion
    return roundMoney(taxableAmount - (taxableAmount / (1 + taxRate)))
  } else {
    // Tax is added on top
    return roundMoney(taxableAmount * taxRate)
  }
}

// Calculate totals for a single cart item
export const calculateCartItemTotals = (
  item: Omit<CartItem, 'lineTotal' | 'discountAmount' | 'lineTotalAfterDiscount' | 'taxAmount' | 'taxableAmount'>,
  taxIncluded: boolean = false
): Pick<CartItem, 'lineTotal' | 'discountAmount' | 'lineTotalAfterDiscount' | 'taxAmount' | 'taxableAmount'> => {
  const lineTotal = roundMoney(item.unitPrice * item.quantity)
  
  // Calculate discount
  const discountAmount = item.discountType && item.discountValue 
    ? calculateItemDiscount(lineTotal, item.discountType, item.discountValue)
    : 0
  
  const lineTotalAfterDiscount = roundMoney(lineTotal - discountAmount)
  
  // Calculate tax on the discounted amount (if item is taxable)
  const taxableAmount = item.product.taxable ? lineTotalAfterDiscount : 0
  const taxAmount = taxableAmount > 0 ? calculateItemTax(taxableAmount, item.taxRate, taxIncluded) : 0
  
  return {
    lineTotal,
    discountAmount,
    lineTotalAfterDiscount,
    taxAmount,
    taxableAmount
  }
}

// Apply global discounts to cart
export const calculateGlobalDiscounts = (
  subtotal: number,
  discounts: CartDiscount[]
): { totalDiscount: number; applicableDiscounts: CartDiscount[] } => {
  let totalDiscount = 0
  const applicableDiscounts: CartDiscount[] = []
  
  for (const discount of discounts) {
    // Check if discount is applicable
    if (discount.minimumAmount && subtotal < discount.minimumAmount) {
      continue
    }
    
    // Check validity dates
    const now = new Date()
    if (discount.validFrom && now < discount.validFrom) continue
    if (discount.validUntil && now > discount.validUntil) continue
    
    // Calculate discount amount
    let discountAmount = 0
    switch (discount.type) {
      case 'percentage':
        discountAmount = roundMoney(subtotal * (discount.value / 100))
        break
      case 'fixed_amount':
        discountAmount = Math.min(discount.value, subtotal)
        break
      // Note: 'buy_x_get_y' discounts would be handled at item level
    }
    
    if (discountAmount > 0) {
      totalDiscount += discountAmount
      applicableDiscounts.push(discount)
    }
  }
  
  return { totalDiscount: roundMoney(totalDiscount), applicableDiscounts }
}

// Calculate complete cart totals
export const calculateCartTotals = (
  items: CartItem[],
  globalDiscounts: CartDiscount[] = [],
  taxIncluded: boolean = false
): CartTotals => {
  if (items.length === 0) {
    return {
      subtotal: 0,
      totalDiscount: 0,
      subtotalAfterDiscount: 0,
      totalTax: 0,
      grandTotal: 0,
      itemCount: 0,
      uniqueItemCount: 0
    }
  }
  
  // Calculate item-level totals
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0))
  const itemDiscounts = roundMoney(items.reduce((sum, item) => sum + (item.discountAmount || 0), 0))
  const subtotalAfterItemDiscounts = roundMoney(subtotal - itemDiscounts)
  
  // Apply global discounts
  const { totalDiscount: globalDiscountAmount } = calculateGlobalDiscounts(
    subtotalAfterItemDiscounts,
    globalDiscounts
  )
  
  const totalDiscount = roundMoney(itemDiscounts + globalDiscountAmount)
  const subtotalAfterDiscount = roundMoney(subtotal - totalDiscount)
  
  // Calculate total tax
  const totalTax = roundMoney(items.reduce((sum, item) => sum + item.taxAmount, 0))
  
  // Calculate grand total
  const grandTotal = taxIncluded 
    ? subtotalAfterDiscount // Tax is already included in item prices
    : roundMoney(subtotalAfterDiscount + totalTax)
  
  // Count items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const uniqueItemCount = items.length
  
  return {
    subtotal,
    totalDiscount,
    subtotalAfterDiscount,
    totalTax,
    grandTotal,
    itemCount,
    uniqueItemCount
  }
}

// Generate unique cart item ID
export const generateCartItemId = (productId: string, timestamp?: number): string => {
  const time = timestamp || Date.now()
  return `${productId}_${time}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate unique cart ID
export const generateCartId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validate cart item quantity
export const validateQuantity = (
  quantity: number,
  product: { maxQuantity?: number; stockLevel?: number },
  allowBackorder: boolean = false
): { isValid: boolean; message?: string; adjustedQuantity?: number } => {
  if (quantity <= 0) {
    return { isValid: false, message: 'Quantity must be greater than 0' }
  }
  
  // Check maximum quantity limit
  if (product.maxQuantity && quantity > product.maxQuantity) {
    return {
      isValid: false,
      message: `Maximum quantity allowed is ${product.maxQuantity}`,
      adjustedQuantity: product.maxQuantity
    }
  }
  
  // Check stock level
  if (product.stockLevel !== undefined && quantity > product.stockLevel && !allowBackorder) {
    return {
      isValid: false,
      message: `Only ${product.stockLevel} items available in stock`,
      adjustedQuantity: product.stockLevel
    }
  }
  
  return { isValid: true }
}

// Check if two cart items represent the same product configuration
export const isSameCartItem = (item1: CartItem, item2: CartItem): boolean => {
  return (
    item1.product.id === item2.product.id &&
    item1.unitPrice === item2.unitPrice &&
    item1.discountType === item2.discountType &&
    item1.discountValue === item2.discountValue &&
    item1.taxRate === item2.taxRate
  )
}

// Format money for display
export const formatMoney = (amount: number, currency: string = '$'): string => {
  return `${currency}${amount.toFixed(2)}`
}

// Format tax rate for display
export const formatTaxRate = (rate: number): string => {
  return `${(rate * 100).toFixed(2)}%`
}

// Calculate change to give customer
export const calculateChange = (totalPaid: number, grandTotal: number): number => {
  return Math.max(0, roundMoney(totalPaid - grandTotal))
}

// Validate payment amounts for split payments
export const validatePaymentAmounts = (
  paymentAmounts: number[],
  grandTotal: number
): { isValid: boolean; totalPaid: number; change: number; shortfall: number } => {
  const totalPaid = roundMoney(paymentAmounts.reduce((sum, amount) => sum + amount, 0))
  const change = calculateChange(totalPaid, grandTotal)
  const shortfall = Math.max(0, roundMoney(grandTotal - totalPaid))
  
  return {
    isValid: totalPaid >= grandTotal,
    totalPaid,
    change,
    shortfall
  }
}