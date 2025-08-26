# Shopping Cart Redux Implementation

## Overview

This implementation provides a comprehensive Redux-based shopping cart system designed for Point of Sale (POS) operations. It includes advanced features like tax calculations, discounts, split payments, and cross-tab synchronization.

## Architecture

### Core Files

1. **Types** (`src/types/cart.ts`)
   - Complete type definitions for cart entities
   - Supports complex POS scenarios

2. **Redux Slice** (`src/store/slices/cartSlice.ts`)
   - Main cart state management
   - Actions for all cart operations
   - Async thunks for initialization and persistence

3. **Utilities**
   - `src/utils/cartCalculations.ts` - Mathematical operations
   - `src/utils/cartPersistence.ts` - localStorage and cross-tab sync

4. **Selectors** (`src/store/selectors/cartSelectors.ts`)
   - Advanced cart data queries
   - Computed values and analytics

5. **Hooks** (`src/hooks/useCart.ts`)
   - React hooks for easy cart integration
   - Multiple specialized hooks for different use cases

## Key Features

### ✅ Core Cart Operations
- **Add/Remove Items**: Full product management with quantity validation
- **Update Quantities**: Real-time quantity adjustments with stock validation
- **Clear Cart**: Complete cart reset with sync broadcasting

### ✅ Advanced Calculations
- **Tax Calculations**: Item-level and total tax with configurable rates
- **Discount Support**: 
  - Item-level discounts (percentage/fixed amount)
  - Global cart discounts
  - Minimum amount validation
- **Precision Handling**: Configurable monetary rounding

### ✅ Payment Management
- **Split Payments**: Multiple payment methods per transaction
- **Payment Validation**: Automatic change calculation and validation
- **Payment Types**: Cash, credit card, digital wallet, gift card, store credit

### ✅ Persistence & Sync
- **localStorage Persistence**: Automatic cart saving/loading
- **Cross-tab Synchronization**: Real-time sync across browser tabs
- **Auto-save**: Debounced automatic saving
- **Schema Versioning**: Migration support for cart structure changes

### ✅ POS-Specific Features
- **Customer Information**: Optional customer association
- **Receipt Data**: Complete receipt generation data
- **Cashier/Store Context**: Multi-store and multi-user support
- **Transaction Metadata**: Notes, device info, timestamps

### ✅ Validation & Analytics
- **Stock Validation**: Inventory level checking with backorder support
- **Cart Validation**: Comprehensive validation before checkout
- **Analytics**: Purchase patterns, category breakdown, metrics
- **Low Stock Warnings**: Automatic stock level alerts

## Usage Examples

### Basic Usage

```tsx
import { useCart } from '../hooks/useCart'

function ShoppingCart() {
  const cart = useCart()
  
  // Initialize cart
  useEffect(() => {
    cart.initialize('store-id', 'cashier-id')
  }, [])
  
  // Add item
  const handleAddItem = () => {
    cart.addItem({
      product: {
        id: '1',
        name: 'Coffee',
        price: 2.50,
        category: 'Beverages',
        taxable: true,
        taxRate: 0.08
      },
      quantity: 1
    })
  }
  
  return (
    <div>
      <p>Items: {cart.itemCount}</p>
      <p>Total: {cart.formattedTotals.grandTotal}</p>
      <button onClick={handleAddItem}>Add Coffee</button>
      <button onClick={cart.clear}>Clear Cart</button>
    </div>
  )
}
```

### Advanced Usage with Discounts and Payments

```tsx
function CheckoutFlow() {
  const cart = useCart()
  const validation = useCartValidation()
  
  const handleApplyDiscount = () => {
    cart.addDiscount({
      id: 'discount-1',
      type: 'percentage',
      value: 10,
      name: '10% Off'
    })
  }
  
  const handleAddPayment = () => {
    cart.addPayment({
      id: 'payment-1',
      type: 'cash',
      name: 'Cash',
      amount: cart.grandTotal
    })
  }
  
  return (
    <div>
      <button onClick={handleApplyDiscount}>Apply 10% Discount</button>
      <button onClick={handleAddPayment}>Pay with Cash</button>
      
      {validation.readyForCheckout ? (
        <button>Complete Sale</button>
      ) : (
        <div>
          {validation.warnings.map(warning => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Using Specialized Hooks

```tsx
// Simple cart operations
const simpleCart = useSimpleCart()

// Individual item management
const cartItem = useCartItem('item-id')

// Cart analytics
const analytics = useCartAnalytics()

// Validation only
const validation = useCartValidation()
```

## State Structure

```typescript
interface CartState {
  // Items and calculations
  items: CartItem[]
  totals: CartTotals
  
  // Context
  customer: CartCustomer | null
  appliedDiscounts: CartDiscount[]
  paymentMethods: PaymentMethod[]
  
  // Configuration
  taxConfig: TaxConfig | null
  defaultTaxRate: number
  settings: CartSettings
  
  // Metadata
  cartId: string
  storeId: string | null
  cashierId: string | null
  
  // State management
  isLoading: boolean
  error: string | null
  isDirty: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Configuration

### Redux Store Setup

```typescript
// src/store/index.ts
import cartReducer from './slices/cartSlice'

export const store = configureStore({
  reducer: {
    // ... other reducers
    cart: cartReducer,
  },
})
```

### Settings

The cart supports various configuration options:

```typescript
settings: {
  autoCalculateTax: boolean        // Auto-apply tax calculations
  allowBackorder: boolean          // Allow overselling inventory
  roundingPrecision: number        // Decimal places for money
  taxIncluded: boolean            // Whether prices include tax
}
```

## Cross-tab Synchronization

The cart automatically synchronizes across browser tabs using localStorage events:

```typescript
// Events broadcasted:
- CART_UPDATED: When cart items change
- CART_CLEARED: When cart is cleared
- ITEM_ADDED: When items are added
- ITEM_REMOVED: When items are removed
- TOTALS_CHANGED: When calculations update
```

## Best Practices

### Performance
- Use memoized selectors for expensive calculations
- Debounce cart saves to reduce localStorage writes
- Use specialized hooks for specific use cases

### Data Integrity
- Always validate quantities against stock levels
- Use proper decimal handling for monetary calculations
- Validate payment amounts before completing transactions

### User Experience
- Provide clear validation messages
- Show loading states during operations
- Sync cart state across tabs for seamless experience

## Error Handling

The cart includes comprehensive error handling:

```typescript
// Common error scenarios handled:
- Invalid quantities
- Out of stock items
- Payment validation failures
- localStorage access issues
- Network failures during sync
```

## Testing

The implementation includes:
- Unit tests for calculation utilities
- Integration tests for Redux operations  
- Mock data for development and testing

## Migration & Versioning

Cart data includes version information for handling schema changes:

```typescript
interface CartPersistenceData {
  cartState: CartState
  timestamp: number
  version: string  // For handling migrations
}
```

## Performance Considerations

- **Memoized Selectors**: All computed values are memoized
- **Debounced Saves**: Auto-save with 1-second debounce
- **Efficient Updates**: Only recalculate when necessary
- **Selective Re-renders**: Fine-grained state updates

This cart implementation provides a solid foundation for any POS or e-commerce application requiring advanced cart functionality with persistence, synchronization, and comprehensive business logic support.