import DashboardGrid from '../src/components/dashboard/DashboardGrid'
import PageWithShortcuts from '../src/components/layout/PageWithShortcuts'
import { Button } from '../src/components/ui/button'

import RouteGuard from './components/RouteGuard'

export default function HomePage() {
  return (
    <RouteGuard>
      <PageWithShortcuts
        title="Dashboard"
        description="Keyboard-first POS UI. Use Ctrl+Shift shortcuts to navigate."
      >
        <div className="space-y-6">
          <section id="section-1" aria-label="Sales overview">
            <DashboardGrid />
          </section>
        </div>
      </PageWithShortcuts>
    </RouteGuard>
  )
}
