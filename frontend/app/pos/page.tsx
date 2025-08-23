import RouteGuard from '../components/RouteGuard'
import PageWithShortcuts from '../../src/components/layout/PageWithShortcuts'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Input } from '../../src/components/ui/input'
import { 
  ShoppingCart, 
  Search, 
  Scan,
  CreditCard,
  Banknote,
  Receipt,
  Trash2,
  Plus,
  Minus
} from 'lucide-react'

export default function POSPage() {
  const cartItems = [
    { id: 1, name: "Coffee - Medium", price: 4.50, qty: 2 },
    { id: 2, name: "Blueberry Muffin", price: 3.25, qty: 1 },
    { id: 3, name: "Sandwich - Turkey", price: 8.95, qty: 1 }
  ]

  const products = [
    { id: 1, name: "Coffee - Small", price: 3.50, category: "Beverages" },
    { id: 2, name: "Coffee - Medium", price: 4.50, category: "Beverages" },
    { id: 3, name: "Coffee - Large", price: 5.50, category: "Beverages" },
    { id: 4, name: "Blueberry Muffin", price: 3.25, category: "Bakery" },
    { id: 5, name: "Chocolate Croissant", price: 4.75, category: "Bakery" },
    { id: 6, name: "Sandwich - Turkey", price: 8.95, category: "Food" }
  ]

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)

  return (
    <RouteGuard>
      <PageWithShortcuts
        title="Point of Sale"
        description="Process sales transactions with our intuitive POS interface"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Scan */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="default" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Scan
              </Button>
            </div>

            {/* Product Categories */}
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Beverages</Button>
              <Button variant="outline" size="sm">Food</Button>
              <Button variant="outline" size="sm">Bakery</Button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-auto">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                      <div className="text-2xl">🛍️</div>
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-muted-foreground text-xs mb-2">{product.category}</p>
                    <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-4">
            {/* Cart */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="h-5 w-5" />
                  Current Sale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No items in cart</p>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[20px] text-center">{item.qty}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Totals and Payment */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8.5%):</span>
                    <span>${(total * 0.085).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${(total * 1.085).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full flex items-center gap-2" size="lg">
                    <CreditCard className="h-4 w-4" />
                    Card Payment
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2" size="lg">
                    <Banknote className="h-4 w-4" />
                    Cash Payment
                  </Button>
                  <Button variant="ghost" className="w-full flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWithShortcuts>
    </RouteGuard>
  )
}