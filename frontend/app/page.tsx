import Button from './components/Button'
import RouteGuard from './components/RouteGuard'

export default function HomePage() {
  return (
    <RouteGuard>
      <main className="p-8">
        <section className="max-w-3xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to IntelliSales</h1>
          <p className="text-gray-600 mt-3">Next.js 14 App Router + TypeScript + Tailwind CSS</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="secondary">Learn More</Button>
          </div>
        </section>
      </main>
    </RouteGuard>
  )
}
