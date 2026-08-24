'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { DataTable } from '@/components/ui/data-table'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { getExpiringPantryItems } from '@/services/dashboard'
import { formatDate } from '@/lib/utils-cafe'

const WINDOW_OPTIONS = [3, 7, 14, 30]

export default function ManagerExpiry() {
  const [days, setDays] = useState(7)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getExpiringPantryItems(days)
      .then(setItems)
      .catch((err) => {
        console.error('Failed to load expiring items:', err)
        setError(err.message || 'Failed to load expiry data.')
      })
      .finally(() => setLoading(false))
  }, [days])

  const today = new Date()

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Expiry Tracking</h1>
            <p className="text-sm text-foreground/60">Ingredients expiring soon</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg text-foreground/60">Show items expiring within</span>
            {WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDays(opt)}
                className={`px-3 py-1.5 rounded-lg text-lg font-medium border transition-colors ${
                  days === opt ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-foreground/70 hover:bg-muted'
                }`}
              >
                {opt} days
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && items.length === 0 && !error && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 flex items-center gap-3 text-green-600">
              <CheckCircle2 size={22} />
              <p>Nothing expiring in the next {days} days.</p>
            </div>
          )}

          {items.length > 0 && (
            <DataTable
              columns={[
                { key: 'name', label: 'Ingredient' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'unit', label: 'Unit' },
                {
                  key: 'expiry_date',
                  label: 'Expires',
                  render: (d) => {
                    const daysLeft = Math.ceil((new Date(d) - today) / (1000 * 60 * 60 * 24))
                    return (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-medium">
                        <AlertCircle size={14} />
                        {formatDate(d)} ({daysLeft <= 0 ? 'today' : `${daysLeft}d left`})
                      </span>
                    )
                  },
                },
              ]}
              data={items}
            />
          )}
        </div>
      </main>
    </div>
  )
}
