"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

import PageWithShortcuts from '../../src/components/layout/PageWithShortcuts'
import { Input } from '../../src/components/ui/input'
import RouteGuard from '../components/RouteGuard'


interface CartItem {
  id: string
  productCode: string
  name: string
  price: number
  qty: number
  total: number
}

interface Product {
  code: string
  name: string
  price: number
  category: string
}

const products: Product[] = [
  { code: "COF-SM", name: "Coffee - Small", price: 3.50, category: "Beverages" },
  { code: "COF-MD", name: "Coffee - Medium", price: 4.50, category: "Beverages" },
  { code: "COF-LG", name: "Coffee - Large", price: 5.50, category: "Beverages" },
  { code: "MUF-BB", name: "Blueberry Muffin", price: 3.25, category: "Bakery" },
  { code: "CRO-CH", name: "Chocolate Croissant", price: 4.75, category: "Bakery" },
  { code: "SAN-TK", name: "Sandwich - Turkey", price: 8.95, category: "Food" }
]

export default function POSPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [currentRow, setCurrentRow] = useState(0)
  const [currentColumn, setCurrentColumn] = useState(0)
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null)
  const [productLookup, setProductLookup] = useState('')
  const [showLookup, setShowLookup] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)
  
  const tableRef = useRef<HTMLTableElement>(null)
  const lookupRef = useRef<HTMLInputElement>(null)
  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Column definitions
  const columns = ['Product Code', 'Description', 'Price', 'Qty', 'Total']

  // Add empty row if needed
  useEffect(() => {
    if (cartItems.length === 0 || cartItems[cartItems.length - 1].productCode !== '') {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productCode: '',
        name: '',
        price: 0,
        qty: 0,
        total: 0
      }
      setCartItems(prev => [...prev, newItem])
    }
  }, [cartItems])

  // Product lookup filtering
  useEffect(() => {
    if (productLookup.trim()) {
      const filtered = products.filter(p => 
        p.code.toLowerCase().includes(productLookup.toLowerCase()) ||
        p.name.toLowerCase().includes(productLookup.toLowerCase())
      )
      setFilteredProducts(filtered)
      setSelectedProductIndex(0)
    } else {
      setFilteredProducts([])
    }
  }, [productLookup])

  const addProduct = useCallback((product: Product, qty: number = 1) => {
    const newItem: CartItem = {
      id: Date.now().toString(),
      productCode: product.code,
      name: product.name,
      price: product.price,
      qty: qty,
      total: product.price * qty
    }
    
    setCartItems(prev => {
      const items = [...prev]
      if (currentRow < items.length) {
        items[currentRow] = newItem
      } else {
        items.push(newItem)
      }
      return items
    })
    
    setShowLookup(false)
    setProductLookup('')
    setCurrentRow(prev => prev + 1)
    setCurrentColumn(0)
  }, [currentRow])

  const updateCartItem = useCallback((rowIndex: number, field: keyof CartItem, value: any) => {
    setCartItems(prev => {
      const items = [...prev]
      const item = { ...items[rowIndex] }
      
      if (field === 'productCode' && value) {
        const product = products.find(p => p.code === value)
        if (product) {
          item.productCode = product.code
          item.name = product.name
          item.price = product.price
          item.qty = item.qty || 1
          item.total = product.price * (item.qty || 1)
        }
      } else if (field === 'qty') {
        item.qty = Math.max(0, parseFloat(value) || 0)
        item.total = item.price * item.qty
      } else if (field === 'price') {
        item.price = Math.max(0, parseFloat(value) || 0)
        item.total = item.price * item.qty
      } else {
        // Assign using a typed index to satisfy TS when using a dynamic keyof
        ;(item as Record<keyof CartItem, any>)[field] = value
      }
      
      items[rowIndex] = item
      return items
    })
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (editingCell) return
    
    const maxRows = cartItems.length
    const maxCols = columns.length - 1 // -1 because Total is calculated
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setCurrentRow(prev => Math.max(0, prev - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setCurrentRow(prev => Math.min(maxRows - 1, prev + 1))
        break
      case 'ArrowLeft':
        e.preventDefault()
        setCurrentColumn(prev => Math.max(0, prev - 1))
        break
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault()
        if (currentColumn < maxCols - 1) {
          setCurrentColumn(prev => prev + 1)
        } else {
          setCurrentColumn(0)
          setCurrentRow(prev => Math.min(maxRows - 1, prev + 1))
        }
        break
      case 'Enter':
        e.preventDefault()
        if (currentColumn === 0) { // Product Code column
          setShowLookup(true)
          setTimeout(() => lookupRef.current?.focus(), 0)
        } else {
          setEditingCell({ row: currentRow, col: currentColumn })
        }
        break
      case 'Delete':
      case 'Backspace':
        if (currentRow < cartItems.length && cartItems[currentRow].productCode) {
          setCartItems(prev => prev.filter((_, idx) => idx !== currentRow))
        }
        break
      case 'F4': // Quick payment
        e.preventDefault()
        handlePayment('cash')
        break
      case 'F5': // Card payment  
        e.preventDefault()
        handlePayment('card')
        break
    }
  }, [currentRow, currentColumn, editingCell, cartItems.length, columns.length])

  const handleLookupKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setSelectedProductIndex(prev => Math.max(0, prev - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedProductIndex(prev => Math.min(filteredProducts.length - 1, prev + 1))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredProducts[selectedProductIndex]) {
          addProduct(filteredProducts[selectedProductIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowLookup(false)
        setProductLookup('')
        break
    }
  }, [filteredProducts, selectedProductIndex, addProduct])

  const handlePayment = useCallback((type: 'cash' | 'card') => {
    // Payment processing logic here
    console.log(`Processing ${type} payment`)
    // Clear cart after payment
    setCartItems([])
    setCurrentRow(0)
    setCurrentColumn(0)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.total || 0), 0)
  const tax = subtotal * 0.085
  const total = subtotal + tax

  return (
    <RouteGuard>
      <PageWithShortcuts
        title="Point of Sale - Data Grid"
        description="Keyboard-first POS interface. Use arrow keys to navigate, Enter to edit, F4 for cash, F5 for card."
      >
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><kbd className="kbd">↑↓←→</kbd> Navigate</div>
              <div><kbd className="kbd">Enter</kbd> Edit/Lookup</div>
              <div><kbd className="kbd">Del</kbd> Remove item</div>
              <div><kbd className="kbd">Tab</kbd> Next cell</div>
              <div><kbd className="kbd">F4</kbd> Cash payment</div>
              <div><kbd className="kbd">F5</kbd> Card payment</div>
              <div><kbd className="kbd">Esc</kbd> Cancel</div>
            </div>
          </div>

          {/* Main POS Grid */}
          <div className="border rounded-lg overflow-hidden">
            <table ref={tableRef} className="w-full">
              <thead className="bg-muted">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="text-left p-3 font-medium border-r border-border last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, rowIdx) => (
                  <tr 
                    key={item.id}
                    className={`border-t border-border ${currentRow === rowIdx ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                  >
                    {/* Product Code */}
                    <td className={`p-2 border-r border-border font-mono ${currentRow === rowIdx && currentColumn === 0 ? 'bg-primary/10 ring-2 ring-primary' : ''}`}>
                      {item.productCode || (currentRow === rowIdx && currentColumn === 0 ? '▶' : '')}
                    </td>
                    
                    {/* Description */}
                    <td className={`p-2 border-r border-border ${currentRow === rowIdx && currentColumn === 1 ? 'bg-primary/10 ring-2 ring-primary' : ''}`}>
                      {editingCell?.row === rowIdx && editingCell?.col === 1 ? (
                        <Input
                          value={item.name}
                          onChange={(e) => updateCartItem(rowIdx, 'name', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              setEditingCell(null)
                            }
                          }}
                          className="h-8 border-0 p-1"
                          autoFocus
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    
                    {/* Price */}
                    <td className={`p-2 border-r border-border text-right ${currentRow === rowIdx && currentColumn === 2 ? 'bg-primary/10 ring-2 ring-primary' : ''}`}>
                      {editingCell?.row === rowIdx && editingCell?.col === 2 ? (
                        <Input
                          value={item.price.toString()}
                          onChange={(e) => updateCartItem(rowIdx, 'price', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              setEditingCell(null)
                            }
                          }}
                          className="h-8 border-0 p-1 text-right"
                          autoFocus
                        />
                      ) : (
                        item.price ? `$${item.price.toFixed(2)}` : ''
                      )}
                    </td>
                    
                    {/* Quantity */}
                    <td className={`p-2 border-r border-border text-right ${currentRow === rowIdx && currentColumn === 3 ? 'bg-primary/10 ring-2 ring-primary' : ''}`}>
                      {editingCell?.row === rowIdx && editingCell?.col === 3 ? (
                        <Input
                          value={item.qty.toString()}
                          onChange={(e) => updateCartItem(rowIdx, 'qty', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              setEditingCell(null)
                            }
                          }}
                          className="h-8 border-0 p-1 text-right"
                          autoFocus
                        />
                      ) : (
                        item.qty || ''
                      )}
                    </td>
                    
                    {/* Total */}
                    <td className={`p-2 text-right font-medium ${currentRow === rowIdx && currentColumn === 4 ? 'bg-primary/10 ring-2 ring-primary' : ''}`}>
                      {item.total ? `$${item.total.toFixed(2)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-80 bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8.5%):</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="font-mono">${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                Press <kbd className="kbd">F4</kbd> for Cash or <kbd className="kbd">F5</kbd> for Card
              </div>
            </div>
          </div>

          {/* Product Lookup Modal */}
          {showLookup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background border rounded-lg shadow-lg w-96 max-h-96">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Product Lookup</h3>
                  <Input
                    ref={lookupRef}
                    value={productLookup}
                    onChange={(e) => setProductLookup(e.target.value)}
                    onKeyDown={handleLookupKeyDown}
                    placeholder="Type product code or name..."
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-auto">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={product.code}
                      className={`p-3 border-b border-border cursor-pointer ${
                        idx === selectedProductIndex ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => addProduct(product)}
                    >
                      <div className="font-medium">{product.code}</div>
                      <div className="text-sm text-muted-foreground">{product.name}</div>
                      <div className="text-sm font-medium">${product.price.toFixed(2)}</div>
                    </div>
                  ))}
                  {productLookup && filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No products found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageWithShortcuts>
    </RouteGuard>
  )
}