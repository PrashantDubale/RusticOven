'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { BarChart, LineChart } from '@/components/chart'
import { KPICard } from '@/components/ui/kpi-card'
import { getSummary, getTodaySales, getTopProducts as fetchTopProducts } from '@/services/dashboard'
import { formatPrice } from '@/lib/utils-cafe'
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react'

export default function ManagerAnalytics() {
  const [summary, setSummary] = useState({ total_sales: 0, orders_count: 0, active_orders: 0, low_stock_count: 0 })
  const [todaySales, setTodaySales] = useState({ total_sales: 0 })
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    getSummary().then(setSummary).catch((err) => console.error('Failed to load summary:', err))
    getTodaySales().then(setTodaySales).catch((err) => console.error("Failed to load today's sales:", err))
    fetchTopProducts(5).then(setTopProducts).catch((err) => console.error('Failed to load top products:', err))
  }, [])

  // Top Products is the only chart here backed by a real endpoint
  // (GET /analytics/top-products - see backend/routes/analytics.py).
  // Revenue-over-time and category-breakdown charts stay mock: the
  // backend has no stored daily/weekly sales history and no
  // per-category revenue endpoint yet (see services/dashboard.js).
  const revenueData = [
    { label: 'Week 1', value: 4200 },
    { label: 'Week 2', value: 5100 },
    { label: 'Week 3', value: 4800 },
    { label: 'Week 4', value: 6200 },
    { label: 'Week 5', value: 7100 },
  ]

  const topProductsChartData = topProducts.map((p) => ({ label: p.name, value: Math.round(p.revenue) }))

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
            <p className="text-sm text-foreground/60">A closer look at sales performance</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Total Sales" value={formatPrice(summary.total_sales)} icon={DollarSign} change={12} trend="up" />
            <KPICard title="Today's Revenue" value={formatPrice(todaySales.total_sales)} icon={TrendingUp} change={8} trend="up" />
            <KPICard title="Total Orders" value={String(summary.orders_count)} icon={ShoppingCart} />
            <KPICard title="Active Orders" value={String(summary.active_orders)} icon={Package} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topProductsChartData.length > 0 ? (
              <BarChart title="Top Products by Revenue" data={topProductsChartData} />
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center text-base text-foreground/60">
                No sales data yet
              </div>
            )}
            <LineChart title="Revenue Trend (sample data)" data={revenueData} />
          </div>

          <p className="text-sm text-foreground/50">
            Revenue Trend uses placeholder numbers — the backend doesn't store a day-by-day sales history yet, only live totals from current orders.
          </p>
        </div>
      </main>
    </div>
  )
}
