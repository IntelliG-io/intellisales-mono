"use client"

import PageWithShortcuts from '../../src/components/layout/PageWithShortcuts'

export default function SalesPage() {
  return (
    <PageWithShortcuts
      title="Sales Interface"
      description="Three-column layout (Products • Cart • Payment). Use keyboard: F2 qty, F3 price override, F4 discount, F5 payment."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border p-3" aria-label="Product search and categories">
          <h2 className="mb-2 text-sm font-medium">Products</h2>
          <p className="text-sm text-muted-foreground">Use Ctrl+F to focus search. Arrow keys to navigate.</p>
        </div>
        <div className="rounded-lg border border-border p-3" aria-label="Shopping cart">
          <h2 className="mb-2 text-sm font-medium">Cart</h2>
          <p className="text-sm text-muted-foreground">Use Delete to remove item. F2 to edit quantity.</p>
        </div>
        <div className="rounded-lg border border-border p-3" aria-label="Payment actions">
          <h2 className="mb-2 text-sm font-medium">Payment</h2>
          <p className="text-sm text-muted-foreground">Press F5 to proceed to payment. Esc to cancel.</p>
        </div>
      </div>
    </PageWithShortcuts>
  )
}
