/**
 * Cart and POS-related type definitions
 */

// Product information for cart items
export interface CartProduct {
  id: string
  name: string
  price: number
  category: string
  description?: string
  imageUrl?: string
  // Tax configuration
  taxable: boolean
  taxRate?: number
  // Inventory tracking
  stockLevel?: number
  maxQuantity?: number
}

// Individual cart line item
export interface CartItem {
  id: string // Unique cart item ID (different from product ID for handling same product with different configs)
  product: CartProduct
  quantity: number
  
  // Pricing details
  unitPrice: number // Price at time of adding to cart (may differ from current product price)
  lineTotal: number // unitPrice * quantity
  
  // Discounts at item level
  discountType?: 'percentage' | 'fixed_amount'
  discountValue?: number // Percentage (0-100) or fixed amount
  discountAmount?: number // Calculated discount amount
  lineTotalAfterDiscount: number
  
  // Tax calculations
  taxRate: number // Tax rate applied to this item
  taxAmount: number // Calculated tax amount
  taxableAmount: number // Amount subject to tax (after discounts)
  
  // Metadata
  notes?: string // Special instructions or notes
  addedAt: Date
  modifiedAt: Date
}

// Customer information for the cart
export interface CartCustomer {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  // Loyalty/membership info
  membershipLevel?: string
  loyaltyPoints?: number
  memberDiscount?: number
}

// Discount configuration
export interface CartDiscount {
  id: string
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y'
  value: number
  name: string
  description?: string
  // Conditions
  minimumAmount?: number
  applicableCategories?: string[]
  applicableProducts?: string[]
  // Buy X Get Y specific
  buyQuantity?: number
  getQuantity?: number
  // Validity
  validFrom?: Date
  validUntil?: Date
}

// Tax configuration
export interface TaxConfig {
  id: string
  name: string
  rate: number // Percentage as decimal (e.g., 0.08 for 8%)
  description?: string
  applicableCategories?: string[]
  exemptProducts?: string[]
}

// Payment method for checkout
export interface PaymentMethod {
  id: string
  type: 'cash' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'gift_card' | 'store_credit'
  name: string
  amount?: number // For split payments
  // Card-specific fields
  cardLast4?: string
  cardType?: string
  transactionId?: string
}

// Cart totals and calculations
export interface CartTotals {
  subtotal: number // Sum of all line totals before discounts
  totalDiscount: number // Total discount amount
  subtotalAfterDiscount: number // Subtotal minus discounts
  totalTax: number // Total tax amount
  grandTotal: number // Final amount to pay
  itemCount: number // Total number of items
  uniqueItemCount: number // Number of unique products
}

// Cart state interface
export interface CartState {
  // Cart items
  items: CartItem[]
  
  // Customer information
  customer: CartCustomer | null
  
  // Applied discounts
  appliedDiscounts: CartDiscount[]
  
  // Tax configuration
  taxConfig: TaxConfig | null
  defaultTaxRate: number
  
  // Payment information
  paymentMethods: PaymentMethod[]
  
  // Calculated totals
  totals: CartTotals
  
  // Cart metadata
  cartId: string // Unique cart session ID
  storeId: string | null // Associated store
  cashierId: string | null // User processing the sale
  
  // State flags
  isLoading: boolean
  error: string | null
  isDirty: boolean // Has unsaved changes
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // POS specific
  holdReason?: string // If cart is on hold
  receiptNumber?: string // For completed sales
  saleNumber?: string // Generated sale number
  
  // Settings
  settings: {
    autoCalculateTax: boolean
    allowBackorder: boolean // Allow items to be sold even if out of stock
    roundingPrecision: number // Decimal places for monetary calculations
    taxIncluded: boolean // Whether displayed prices include tax
  }
}

// Action payload types
export interface AddToCartPayload {
  product: CartProduct
  quantity?: number
  unitPrice?: number // Override price if different from product price
  notes?: string
}

export interface UpdateCartItemPayload {
  itemId: string
  quantity?: number
  unitPrice?: number
  notes?: string
  discountType?: 'percentage' | 'fixed_amount'
  discountValue?: number
}

export interface RemoveFromCartPayload {
  itemId: string
}

export interface ApplyDiscountPayload {
  discount: CartDiscount
}

export interface SetCustomerPayload {
  customer: CartCustomer
}

export interface AddPaymentMethodPayload {
  paymentMethod: PaymentMethod
}

export interface CartPersistenceData {
  cartState: CartState
  timestamp: number
  version: string // For handling schema migrations
}

// Cart operation results
export interface CartOperationResult {
  success: boolean
  message?: string
  cartTotals?: CartTotals
}

// Cross-tab synchronization events
export interface CartSyncEvent {
  type: 'CART_UPDATED' | 'CART_CLEARED' | 'ITEM_ADDED' | 'ITEM_REMOVED' | 'TOTALS_CHANGED'
  cartId: string
  timestamp: number
  data?: any
}