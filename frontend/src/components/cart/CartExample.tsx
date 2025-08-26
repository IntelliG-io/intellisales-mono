/**
 * Example component demonstrating cart functionality
 * This shows how to use the cart hooks and displays key cart operations
 */

import React, { useEffect } from 'react'
import { useCart, useCartValidation, useCartAnalytics } from '../../hooks/useCart'
import type { CartProduct, CartDiscount } from '../../types/cart'

// Mock product data
const sampleProducts: CartProduct[] = [
  {
    id: '1',
    name: 'Espresso',
    price: 2.50,
    category: 'Beverages',
    description: 'Rich, bold espresso shot',
    taxable: true,
    taxRate: 0.08,
    stockLevel: 100
  },
  {
    id: '2', 
    name: 'Croissant',
    price: 3.25,
    category: 'Pastries',
    description: 'Buttery, flaky croissant',
    taxable: true,
    taxRate: 0.08,
    stockLevel: 25
  },
  {
    id: '3',
    name: 'Coffee Mug',
    price: 15.99,
    category: 'Merchandise',
    description: 'Ceramic coffee mug with logo',
    taxable: true,
    taxRate: 0.08,
    stockLevel: 5
  }
]

// Mock discount
const sampleDiscount: CartDiscount = {
  id: 'discount_1',
  type: 'percentage',
  value: 10,
  name: '10% Off Total',
  description: 'Save 10% on your entire purchase',
  minimumAmount: 5
}

export const CartExample: React.FC = () => {
  const cart = useCart()
  const validation = useCartValidation()
  const analytics = useCartAnalytics()
  
  // Initialize cart on component mount
  useEffect(() => {
    cart.initialize('store-1', 'cashier-1')
  }, [])
  
  const handleAddProduct = (product: CartProduct, quantity: number = 1) => {
    cart.addItem({
      product,
      quantity,
      notes: `Added via example component`
    })
  }
  
  const handleApplyDiscount = () => {
    cart.addDiscount(sampleDiscount)
  }
  
  const handleAddCashPayment = () => {
    cart.addPayment({
      id: 'cash_payment_1',
      type: 'cash',
      name: 'Cash Payment',
      amount: cart.grandTotal
    })
  }
  
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    cart.updateItem({ itemId, quantity })
  }
  
  if (cart.isLoading) {
    return <div className="p-4">Loading cart...</div>
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart Demo</h1>
        
        {cart.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {cart.error}
          </div>
        )}
        
        {/* Product Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Add Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleProducts.map(product => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Stock: {product.stockLevel}</p>
                <button
                  onClick={() => handleAddProduct(product)}
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cart Items */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Cart Items ({cart.itemCount} items)
          </h2>
          
          {cart.isEmpty ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            <div className="space-y-2">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${item.unitPrice.toFixed(2)} × {item.quantity} = ${item.lineTotal.toFixed(2)}
                    </p>
                    {item.discountAmount > 0 && (
                      <p className="text-sm text-green-600">
                        Discount: -${item.discountAmount.toFixed(2)}
                      </p>
                    )}
                    {item.taxAmount > 0 && (
                      <p className="text-sm text-gray-500">
                        Tax: ${item.taxAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="mx-2 font-mono">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => cart.removeItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Cart Totals */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Cart Totals</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{cart.formattedTotals.subtotal}</span>
            </div>
            {cart.totals.totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{cart.formattedTotals.totalDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{cart.formattedTotals.totalTax}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>{cart.formattedTotals.grandTotal}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleApplyDiscount}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              disabled={cart.isEmpty || cart.discounts.some(d => d.id === sampleDiscount.id)}
            >
              Apply 10% Discount
            </button>
            
            <button
              onClick={handleAddCashPayment}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
              disabled={cart.isEmpty}
            >
              Add Cash Payment
            </button>
            
            <button
              onClick={() => cart.setCustomerInfo({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '555-0123'
              })}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
            >
              Set Customer
            </button>
            
            <button
              onClick={cart.clear}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              disabled={cart.isEmpty}
            >
              Clear Cart
            </button>
          </div>
        </div>
        
        {/* Payment Information */}
        {cart.paymentBreakdown.methods.length > 0 && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Payment Methods</h2>
            <div className="space-y-2">
              {cart.paymentBreakdown.methods.map((method, index) => (
                <div key={method.id || index} className="flex justify-between">
                  <span>{method.name}:</span>
                  <span>{method.formattedAmount}</span>
                </div>
              ))}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Paid:</span>
                  <span>${cart.paymentBreakdown.totalPaid.toFixed(2)}</span>
                </div>
                {cart.paymentBreakdown.change > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Change:</span>
                    <span>${cart.paymentBreakdown.change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Validation Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Validation</h2>
          <div className="space-y-2">
            <div className={`p-3 rounded ${validation.readyForCheckout ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <p className="font-medium">
                Status: {validation.readyForCheckout ? 'Ready for Checkout' : 'Not Ready'}
              </p>
              {validation.warnings.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Analytics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Metrics</h3>
              <ul className="text-sm space-y-1">
                <li>Average Item Value: ${analytics.metrics.averageItemValue.toFixed(2)}</li>
                <li>Discount %: {analytics.metrics.discountPercentage.toFixed(1)}%</li>
                <li>Categories: {analytics.metrics.categoriesCount}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Category Breakdown</h3>
              <ul className="text-sm space-y-1">
                {analytics.categoryBreakdown.map(category => (
                  <li key={category.category}>
                    {category.category}: {category.itemCount} items (${category.totalValue.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartExample