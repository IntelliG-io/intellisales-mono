import RouteGuard from './components/RouteGuard'
import PageWithShortcuts from '../src/components/layout/PageWithShortcuts'
import { Button } from '../src/components/ui/button'
import DashboardGrid from '../src/components/dashboard/DashboardGrid'

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
