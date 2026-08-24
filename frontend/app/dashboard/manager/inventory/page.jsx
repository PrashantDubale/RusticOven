'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { DataTable } from '@/components/ui/data-table'
import { Search, Boxes } from 'lucide-react'
import { api } from '@/services/api'
import { formatDate } from '@/lib/utils-cafe'

// Pantry/ingredient stock. Matches backend/routes/pantry.py's
// GET /pantry/ (no dedicated frontend service existed for the full
// list yet - services/dashboard.js only wraps the /expiring-soon and
// /recent variants used on the Overview page).
function getAllPantryItems() {
  return api.get('/pantry/')
}

export default function ManagerInventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllPantryItems()
      .then(setItems)
      .catch((err) => {
        console.error('Failed to load pantry items:', err)
        setError(err.message || 'Failed to load inventory.')
      })
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const filtered = items.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const displayItems = filtered.map((i) => {
    const expiry = i.expiry_date ? new Date(i.expiry_date) : null
    const daysLeft = expiry ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) : null
    return { ...i, daysLeft }
  })

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Inventory</h1>
            <p className="text-sm text-foreground/60">Current pantry / ingredient stock</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-foreground/60">
              <Boxes className="mx-auto mb-3 text-foreground/30" size={32} />
              No pantry items yet. Add stock from the Purchases page.
            </div>
          )}

          {!error && (items.length > 0 || loading) && (
            <DataTable
              columns={[
                { key: 'name', label: 'Ingredient' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'unit', label: 'Unit' },
                { key: 'added_date', label: 'Added', render: (d) => (d ? formatDate(d) : '—') },
                {
                  key: 'expiry_date',
                  label: 'Expiry',
                  render: (d, row) => (
                    <span className={row.daysLeft !== null && row.daysLeft <= 7 ? 'text-red-500 font-medium' : ''}>
                      {d ? formatDate(d) : '—'}
                    </span>
                  ),
                },
              ]}
              data={displayItems}
            />
          )}
        </div>
      </main>
    </div>
  )
}
