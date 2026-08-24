'use client'

import Sidebar from '@/components/sidebar'
import DataTable from '@/components/data-table'
import { Search, ChevronRight, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getOrders } from '@/services/orders'
import { formatPrice } from '@/lib/utils-cafe'
import { Select } from '@/components/ui/select'

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => console.error('Failed to load orders:', err))
  }, [])

  // Maps the real backend order shape (id, customer_name, items: [],
  // subtotal/tax/total, status, created_at - see backend/models.py
  // OrderOut) into the exact same display row shape this table
  // already rendered (id, customer, items, status, amount, date), so
  // DataTable's columns/rendering below stay untouched. The real
  // backend's status values (pending/preparing/ready/delivered/
  // cancelled) also don't match the mock's capitalized
  // Delivered/Processing/Pending/Cancelled 1:1 - the filter dropdown
  // further down uses the real values instead, since a filter option
  // that can never match any real order would just be a broken
  // dead filter, not "preserving design".
  const displayOrders = orders.map((o) => ({
    id: `#${o.id.slice(-6).toUpperCase()}`,
    _rawId: o.id,
    customer: o.customer_name,
    items: String(o.items.reduce((sum, i) => sum + i.quantity, 0)),
    status: o.status,
    amount: formatPrice(o.total),
    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
  }))

  let filteredOrders = displayOrders.filter(o =>
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (filterStatus !== 'all') {
    filteredOrders = filteredOrders.filter(o => o.status === filterStatus)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-500'
      case 'preparing':
      case 'ready':
        return 'bg-blue-500/10 text-blue-500'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-red-500/10 text-red-500'
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
              <p className="text-muted-foreground mt-1">Track and manage customer orders</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:border-accent transition-colors">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'preparing', label: 'Preparing' },
                  { value: 'ready', label: 'Ready' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                className="border-0 px-1 py-0 bg-transparent hover:border-0"
              />
            </div>
          </div>

          {/* Orders Table */}
          <DataTable
            columns={[
              { header: 'Order ID', accessor: 'id' },
              { header: 'Customer', accessor: 'customer' },
              { header: 'Items', accessor: 'items', width: 'w-16' },
              { header: 'Status', accessor: 'status' },
              { header: 'Amount', accessor: 'amount' },
              { header: 'Date', accessor: 'date' },
            ]}
            data={filteredOrders.map(o => ({
              ...o,
              status: <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(o.status)}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
            }))}
            actions={() => (
              <button className="text-muted-foreground hover:text-accent transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          />
        </div>
      </main>
    </div>
  )
}
