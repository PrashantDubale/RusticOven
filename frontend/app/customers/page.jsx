'use client'

import Sidebar from '@/components/sidebar'
import DataTable from '@/components/data-table'
import { Search, Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCustomers } from '@/services/customers'
import { formatPrice } from '@/lib/utils-cafe'

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch((err) => console.error('Failed to load customers:', err))
  }, [])

  // Maps the real backend customer shape (id, name, email, phone,
  // loyalty_points, total_orders, total_spent - see
  // backend/models.py CustomerOut) into the same display row shape
  // this table already rendered. One real gap: the backend has no
  // "when did this customer sign up" field at all (CustomerOut has
  // no created_at/joinDate), so that column shows a placeholder
  // rather than a fabricated date - the column itself is left in
  // place rather than removed, to keep the table structure identical.
  const displayCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '—',
    orders: String(c.total_orders),
    totalSpent: formatPrice(c.total_spent),
    joinDate: '—',
  }))

  const filteredCustomers = displayCustomers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
              <p className="text-muted-foreground mt-1">View and manage your customer base</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-foreground">{customers.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm mb-1">Avg. Order Value</p>
              <p className="text-3xl font-bold text-foreground">{formatPrice(avgOrderValue)}</p>
            </div>
          </div>

          {/* Customers Table */}
          <DataTable
            columns={[
              { header: 'Customer ID', accessor: 'id' },
              { header: 'Name', accessor: 'name' },
              { header: 'Email', accessor: 'email' },
              { header: 'Phone', accessor: 'phone' },
              { header: 'Orders', accessor: 'orders', width: 'w-16' },
              { header: 'Total Spent', accessor: 'totalSpent' },
              { header: 'Join Date', accessor: 'joinDate' },
            ]}
            data={filteredCustomers}
          />
        </div>
      </main>
    </div>
  )
}
