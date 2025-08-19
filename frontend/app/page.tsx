import RouteGuard from './components/RouteGuard'
import PageWithShortcuts from '../src/components/layout/PageWithShortcuts'
import { Button } from '../src/components/ui/button'

export default function HomePage() {
  return (
    <RouteGuard>
      <PageWithShortcuts
        title="Dashboard"
        description="Keyboard-first POS UI. Use Ctrl+Shift shortcuts to navigate."
      >
        <section className="mx-auto max-w-3xl text-center py-16">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome to IntelliSales</h1>
          <p className="text-muted-foreground mt-3">Next.js 14 + TypeScript + Tailwind + shadcn/ui</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="secondary">Learn More</Button>
          </div>
        </section>
      </PageWithShortcuts>
    </RouteGuard>
  )
}
