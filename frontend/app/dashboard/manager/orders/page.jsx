'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Select } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { getOrders, updateOrderStatus } from '@/services/orders'
import { formatPrice, formatDateTime } from '@/lib/utils-cafe'

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']
const STATUS_ITEMS = STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))
const FILTER_ITEMS = [{ value: 'all', label: 'All Status' }, ...STATUS_ITEMS]

export default function ManagerOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [orders, setOrders] = useState([])
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = () => {
    getOrders()
      .then(setOrders)
      .catch((err) => console.error('Failed to load orders:', err))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, status)
      loadOrders()
    } catch (err) {
      alert(err.message || 'Failed to update order status (manager login required).')
    } finally {
      setUpdatingId(null)
    }
  }

  let filteredOrders = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  if (filterStatus !== 'all') {
    filteredOrders = filteredOrders.filter((o) => o.status === filterStatus)
  }

  const displayOrders = filteredOrders.map((o) => ({
    ...o,
    displayId: `#${o.id.slice(-6).toUpperCase()}`,
    itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
            <p className="text-sm text-foreground/60">Track and manage customer orders</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1 bg-card border border-border rounded-lg">
              <Filter className="w-4 h-4 text-foreground/40" />
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                options={FILTER_ITEMS}
                className="border-0 px-1 py-1.5 bg-transparent hover:border-0"
              />
            </div>
          </div>

          <DataTable
            columns={[
              { key: 'displayId', label: 'Order ID' },
              { key: 'customer_name', label: 'Customer' },
              { key: 'itemCount', label: 'Items' },
              {
                key: 'status',
                label: 'Status',
                render: (status) => <StatusBadge status={status} />,
              },
              { key: 'total', label: 'Amount', render: (total) => formatPrice(total) },
              { key: 'created_at', label: 'Date', render: (date) => formatDateTime(date) },
            ]}
            data={displayOrders}
            actions={(row) => (
              <Select
                value={row.status}
                onValueChange={(status) => handleStatusChange(row.id, status)}
                options={STATUS_ITEMS}
                size="sm"
                disabled={updatingId === row.id}
              />
            )}
          />
        </div>
      </main>
    </div>
  )
}
