import PageWithShortcuts from '../../src/components/layout/PageWithShortcuts'

export default function CustomersPage() {
  return (
    <PageWithShortcuts
      title="Customers"
      description="Search, view, and manage customers. Use keyboard shortcuts for quick actions."
    >
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm text-muted-foreground">Customer list placeholder.</p>
      </div>
    </PageWithShortcuts>
  )
}
