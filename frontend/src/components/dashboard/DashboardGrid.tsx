"use client"

import MetricCard from './MetricCard'
import SalesChartPlaceholder from './SalesChartPlaceholder'
import TopProductsTable from './TopProductsTable'
import { ShoppingCart, CreditCard, TrendingUp, Package } from 'lucide-react'

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* Metrics */}
      <MetricCard title="Today Sales" value="$12,340" delta="+8.2% from yesterday" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} intent="success" />
      <MetricCard title="Transactions" value="452" delta="Peak at 1-2 PM" icon={<CreditCard className="h-4 w-4" />} />
      <MetricCard title="Avg Order Value" value="$27.30" delta="vs $25.10 weekly avg" icon={<ShoppingCart className="h-4 w-4" />} />
      <MetricCard title="Items Sold" value="1,238" delta="Toward 2,000 target" icon={<Package className="h-4 w-4" />} />

      {/* Visualizations */}
      <SalesChartPlaceholder />
      <TopProductsTable />
    </div>
  )
}
