"use client"

import MetricCard from './MetricCard'
import SalesChartPlaceholder from './SalesChartPlaceholder'
import TopProductsTable from './TopProductsTable'
import { 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Package, 
  LineChart, 
  Users, 
  DollarSign,
  AlertTriangle,
  Clock
} from 'lucide-react'

export default function DashboardGrid() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">New Sale</span>
          <span className="sm:hidden">Sale</span>
        </button>
        <button className="flex items-center gap-2 bg-muted text-foreground px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Product</span>
        </button>
        <button className="flex items-center gap-2 bg-muted text-foreground px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">New Customer</span>
          <span className="sm:hidden">Customer</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Today's Sales" 
          value="$12,340" 
          delta="+8.2% from yesterday" 
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />} 
          intent="success" 
        />
        <MetricCard 
          title="Transactions" 
          value="452" 
          delta="+23 from last hour" 
          icon={<CreditCard className="h-4 w-4 text-blue-500" />} 
        />
        <MetricCard 
          title="Avg Order Value" 
          value="$27.30" 
          delta="vs $25.10 weekly avg" 
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />} 
        />
        <MetricCard 
          title="Active Customers" 
          value="1,238" 
          delta="148 new this week" 
          icon={<Users className="h-4 w-4 text-orange-500" />} 
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard 
          title="Items Sold Today" 
          value="324" 
          delta="Toward 500 daily target" 
          icon={<Package className="h-4 w-4 text-green-500" />} 
        />
        <MetricCard 
          title="Low Stock Items" 
          value="12" 
          delta="Requires attention" 
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />} 
          intent="warning"
        />
        <MetricCard 
          title="Peak Hour" 
          value="2-3 PM" 
          delta="$1,200 in sales" 
          icon={<Clock className="h-4 w-4 text-indigo-500" />} 
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChartPlaceholder />
        <TopProductsTable />
      </div>
    </div>
  )
}
