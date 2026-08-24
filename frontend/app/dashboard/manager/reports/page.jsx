'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { KPICard } from '@/components/ui/kpi-card'
import { DataTable } from '@/components/ui/data-table'
import { getSummary, getTodaySales, getTopProducts as fetchTopProducts } from '@/services/dashboard'
import { getOrders } from '@/services/orders'
import { getCustomers } from '@/services/customers'
import { formatPrice } from '@/lib/utils-cafe'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'

// Reports rolls up real numbers from the endpoints that already exist
// (backend/routes/analytics.py, orders.py, customers.py) into one
// printable-style overview. There's no dedicated /reports endpoint on
// the backend - this page just presents the same live data a
// different way, grouped for a periodic "how are we doing" read.
export default function ManagerReports() {
  const [summary, setSummary] = useState({ total_sales: 0, orders_count: 0, active_orders: 0, low_stock_count: 0 })
  const [todaySales, setTodaySales] = useState({ total_sales: 0, orders_count: 0 })
  const [topProducts, setTopProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    getSummary().then(setSummary).catch((err) => console.error('Failed to load summary:', err))
    getTodaySales().then(setTodaySales).catch((err) => console.error("Failed to load today's sales:", err))
    fetchTopProducts(10).then(setTopProducts).catch((err) => console.error('Failed to load top products:', err))
    getOrders().then(setOrders).catch((err) => console.error('Failed to load orders:', err))
    getCustomers().then((c) => setCustomerCount(c.length)).catch((err) => console.error('Failed to load customers:', err))
  }, [])

  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length
  const avgOrderValue = summary.orders_count > 0 ? summary.total_sales / summary.orders_count : 0

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
            <p className="text-sm text-foreground/60">A snapshot of overall business performance</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Lifetime Sales" value={formatPrice(summary.total_sales)} icon={DollarSign} />
            <KPICard title="Today's Sales" value={formatPrice(todaySales.total_sales)} icon={TrendingUp} subtext={`${todaySales.orders_count || 0} orders today`} />
            <KPICard title="Avg. Order Value" value={formatPrice(avgOrderValue)} icon={ShoppingCart} />
            <KPICard title="Total Customers" value={String(customerCount)} icon={Users} />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-1">Order Summary</h2>
            <p className="text-base text-foreground/60 mb-4">All-time counts by outcome</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-lg text-foreground/60">Total Orders</p>
                <p className="text-3xl font-bold">{summary.orders_count}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-lg text-foreground/60">Active</p>
                <p className="text-3xl font-bold">{summary.active_orders}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-lg text-foreground/60">Cancelled</p>
                <p className="text-3xl font-bold">{cancelledCount}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-lg text-foreground/60">Low Stock Items</p>
                <p className="text-3xl font-bold">{summary.low_stock_count}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-1">Top Selling Products</h2>
            <p className="text-base text-foreground/60 mb-4">Ranked by revenue, all-time</p>
            <DataTable
              columns={[
                { key: 'name', label: 'Product' },
                { key: 'units_sold', label: 'Units Sold' },
                { key: 'revenue', label: 'Revenue', render: (r) => formatPrice(r) },
              ]}
              data={topProducts}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
