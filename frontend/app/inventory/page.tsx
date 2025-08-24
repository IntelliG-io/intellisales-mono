"use client"

import PageWithShortcuts from '../../src/components/layout/PageWithShortcuts'

export default function InventoryPage() {
  return (
    <PageWithShortcuts
      title="Inventory Management"
      description="Data table with sidebar filters. Keyboard: arrows to move, Space select, Enter action, Ctrl+A select all."
    >
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm text-muted-foreground">Table placeholder. Implement virtualized rows and full keyboard nav.</p>
      </div>
    </PageWithShortcuts>
  )
}
