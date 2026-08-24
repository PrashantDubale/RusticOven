'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { BarChart, LineChart } from '@/components/chart'
import { getTopProducts } from '@/services/dashboard'

export default function Analytics() {
  // Of this page's four charts, only Top Products has a real backend
  // endpoint behind it (GET /analytics/top-products - see
  // backend/routes/analytics.py). The other three stay hardcoded
  // mock numbers because the backend genuinely has nothing to back
  // them with yet:
  //   - revenueData (weekly trend): no stored daily/weekly sales
  //     history, only live totals computed from current orders
  //   - categoryData (by category): no per-category revenue endpoint
  //   - customerGrowth (monthly): Customer records have no signup
  //     timestamp field at all (see backend/models.py CustomerOut)
  // Each would need a small new backend endpoint to become real.
  const revenueData = [
    { label: 'Week 1', value: 4200 },
    { label: 'Week 2', value: 5100 },
    { label: 'Week 3', value: 4800 },
    { label: 'Week 4', value: 6200 },
    { label: 'Week 5', value: 7100 },
  ]

  const categoryData = [
    { label: 'Coffee', value: 8500 },
    { label: 'Pastries', value: 5200 },
    { label: 'Desserts', value: 3800 },
    { label: 'Beverages', value: 6200 },
    { label: 'Snacks', value: 2100 },
  ]

  const customerGrowth = [
    { label: 'Jan', value: 520 },
    { label: 'Feb', value: 580 },
    { label: 'Mar', value: 650 },
    { label: 'Apr', value: 720 },
    { label: 'May', value: 810 },
    { label: 'Jun', value: 847 },
  ]

  // BarChart/LineChart both expect [{ label, value }] - real
  // top-products data (name, revenue) mapped to that same shape.
  const [topProducts, setTopProducts] = useState([])
  useEffect(() => {
    getTopProducts(5)
      .then((products) => setTopProducts(products.map((p) => ({ label: p.name, value: p.revenue }))))
      .catch((err) => console.error('Failed to load top products:', err))
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-1">Comprehensive business insights and performance metrics</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Revenue Growth</p>
              <p className="text-2xl font-bold text-foreground">+24.5%</p>
              <p className="text-xs text-green-500 mt-2">↑ vs. last month</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Customer Retention</p>
              <p className="text-2xl font-bold text-foreground">87.3%</p>
              <p className="text-xs text-green-500 mt-2">↑ 2.1% increase</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">$52.80</p>
              <p className="text-xs text-green-500 mt-2">↑ 3.5% increase</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Peak Hour</p>
              <p className="text-2xl font-bold text-foreground">9:00 AM</p>
              <p className="text-xs text-muted-foreground mt-2">~45 orders</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart title="Weekly Revenue Trend" data={revenueData} />
            <BarChart title="Revenue by Category" data={categoryData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart title="Customer Growth" data={customerGrowth} />
            <BarChart title="Top Selling Products" data={topProducts} />
          </div>

          {/* Performance Summary */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Strengths</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Strong morning peak performance (9 AM - 11 AM)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>High customer retention rate of 87.3%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Espresso consistently the top performer</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Opportunities</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">→</span>
                    <span>Boost afternoon sales with special promotions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">→</span>
                    <span>Expand pastry line based on growing demand</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">→</span>
                    <span>Introduce combo deals for seasonal beverages</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
