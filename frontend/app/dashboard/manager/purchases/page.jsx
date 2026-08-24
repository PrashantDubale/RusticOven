'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { DataTable } from '@/components/ui/data-table'
import { PackagePlus } from 'lucide-react'
import { api } from '@/services/api'
import { formatDate } from '@/lib/utils-cafe'

// "Purchases" = recording new pantry/ingredient stock coming in.
// There's no separate purchases collection on the backend - a
// purchase IS a new pantry item (backend/routes/pantry.py POST /pantry/,
// stamped with today's added_date). This page is the entry form; the
// resulting stock also shows up on the Inventory page.
const getAllPantryItems = () => api.get('/pantry/')
const addPantryItem = (item) => api.post('/pantry/', item)

const emptyForm = { name: '', quantity: '', unit: 'kg', expiry_date: '' }

export default function ManagerPurchases() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadItems = () => {
    getAllPantryItems()
      .then((data) => setItems([...data].sort((a, b) => (b.added_date || '').localeCompare(a.added_date || ''))))
      .catch((err) => console.error('Failed to load purchases:', err))
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await addPantryItem({
        name: form.name,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        expiry_date: form.expiry_date,
      })
      setForm(emptyForm)
      loadItems()
    } catch (err) {
      setError(err.message || 'Failed to record purchase.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Purchases</h1>
            <p className="text-sm text-foreground/60">Record incoming ingredient stock</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <PackagePlus size={20} className="text-accent" />
              <h2 className="text-lg font-bold">Record a Purchase</h2>
            </div>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Ingredient</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="e.g. Mozzarella"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <input
                  required
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="kg, litres, packets…"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  required
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium invisible block">Action</label>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Add Purchase'}
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Purchase History</h2>
            <DataTable
              columns={[
                { key: 'name', label: 'Ingredient' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'unit', label: 'Unit' },
                { key: 'added_date', label: 'Purchased On', render: (d) => (d ? formatDate(d) : '—') },
                { key: 'expiry_date', label: 'Expires', render: (d) => (d ? formatDate(d) : '—') },
              ]}
              data={items}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
