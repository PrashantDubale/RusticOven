'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { KPICard } from '@/components/ui/kpi-card'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
// salesData stays mock - the real backend has no day-by-day sales
// history endpoint (backend/routes/analytics.py only computes live
// totals from the current orders collection, not a stored daily
// breakdown), so the "Revenue Trend" chart further down has nothing
// real to bind to yet. See services/dashboard.js's top comment for
// what a real endpoint for this would need to look like.
import { salesData } from '@/lib/mockdata'
import { getSummary, getTodaySales, getTopProducts as fetchTopProducts, getExpiringPantryItems } from '@/services/dashboard'
import { getOrders } from '@/services/orders'
import { getCustomers } from '@/services/customers'
import { formatPrice, formatDateTime } from '@/lib/utils-cafe'
import { DollarSign, ShoppingCart, Users, AlertTriangle, TrendingUp, Package } from 'lucide-react'

export default function ManagerDashboard() {
  const [summary, setSummary] = useState({ total_sales: 0, orders_count: 0, active_orders: 0, low_stock_count: 0 })
  const [todaySales, setTodaySales] = useState({ total_sales: 0 })
  const [orders, setOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [expiringCount, setExpiringCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    getSummary().then(setSummary).catch((err) => console.error('Failed to load summary:', err))
    getTodaySales().then(setTodaySales).catch((err) => console.error('Failed to load today\'s sales:', err))
    getOrders().then(setOrders).catch((err) => console.error('Failed to load orders:', err))
    fetchTopProducts(5).then(setTopProducts).catch((err) => console.error('Failed to load top products:', err))
    getExpiringPantryItems(7).then((items) => setExpiringCount(items.length)).catch((err) => console.error('Failed to load pantry:', err))
    getCustomers().then((c) => setCustomerCount(c.length)).catch((err) => console.error('Failed to load customers:', err))
  }, [])

  const lowStockProducts = summary.low_stock_count
  const expiringProducts = expiringCount

  const totalSales = summary.total_sales
  const todayRevenue = todaySales.total_sales

  // Recent Orders table below expects each row's date field under the
  // key "createdAt" (its `render` function references that column
  // key directly) - the real backend sends `created_at` (see
  // backend/models.py OrderOut). Mapped here rather than touching the
  // DataTable column config, so the table's rendering is untouched.
  const recentOrders = orders.slice(0, 5).map((o) => ({ ...o, createdAt: o.created_at }))

  // Real /analytics/top-products sends `units_sold` (see
  // backend/routes/analytics.py) - the section below reads that field
  // name directly.

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
              <p className="text-sm text-foreground/60">Monitor your cafe performance in real-time</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <KPICard
                title="Total Sales"
                value={formatPrice(totalSales)}
                icon={DollarSign}
                change={12}
                changeText="vs last week"
                trend="up"
              />
            </div>
            <div className="lg:col-span-2">
              <KPICard
                title="Today's Revenue"
                value={formatPrice(todayRevenue)}
                icon={TrendingUp}
                change={8}
                trend="up"
              />
            </div>
            <div className="lg:col-span-1">
              <KPICard
                title="Active Orders"
                value={orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length}
                icon={ShoppingCart}
              />
            </div>
            <div className="lg:col-span-1">
              <KPICard
                title="Total Customers"
                value={String(customerCount)}
                icon={Users}
                change={5}
              />
            </div>
          </div>

          {/* Alerts */}
          {(lowStockProducts > 0 || expiringProducts > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockProducts > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-500">Low Stock Alert</p>
                    <p className="text-sm text-foreground/70">{lowStockProducts} products running low</p>
                  </div>
                </div>
              )}
              {expiringProducts > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-red-500">Expiry Alert</p>
                    <p className="text-sm text-foreground/70">{expiringProducts} products expiring soon</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2 min-w-0">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <p className="text-sm text-foreground/60">Latest orders from customers</p>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Order ID' },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (status) => <StatusBadge status={status} />,
                  },
                  {
                    key: 'total',
                    label: 'Amount',
                    render: (total) => formatPrice(total),
                  },
                  {
                    key: 'createdAt',
                    label: 'Time',
                    render: (date) => formatDateTime(date),
                  },
                ]}
                data={recentOrders}
              />
            </div>

            {/* Top Products */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold">Top Products</h2>
                <p className="text-base text-foreground/60">By revenue this week</p>
              </div>
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-lg line-clamp-1">{product.name}</p>
                      <span className="text-base text-accent font-bold">{product.units_sold}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-accent rounded-full h-1.5 transition-all"
                        style={{
                          width: `${(product.revenue / Math.max(...topProducts.map((p) => p.revenue), 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-base text-foreground/60 mt-1">{formatPrice(product.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Revenue Trend</h2>
              <p className="text-base text-foreground/60">Last 7 days performance</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-end justify-around h-48 gap-2">
                {salesData.map((data, idx) => {
                  const maxRevenue = Math.max(...salesData.map((d) => d.revenue))
                  const height = (data.revenue / maxRevenue) * 100
                  return (
                    <div key={idx} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-accent to-accent/50 rounded-t hover:from-accent/90 hover:to-accent/60 transition-all cursor-pointer group relative"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-muted px-2 py-1 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatPrice(data.revenue)}
                        </div>
                      </div>
                      <span className="text-base text-foreground/60 text-center w-full">{data.date}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
