'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { Save } from 'lucide-react'

// There's no /settings endpoint on the backend - cafe profile info
// like name/address/hours isn't stored anywhere in Mongo yet (see
// backend/models.py - no such collection). This form stays local
// state only, same as the old top-level /settings page did, until a
// real settings collection + route exists to save it to.
export default function ManagerSettings() {
  const [formData, setFormData] = useState({
    cafeName: 'Rustic Oven',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    openTime: '07:00',
    closeTime: '20:00',
    currency: 'INR',
    taxRate: '18',
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Nothing to persist server-side yet - just acknowledges the save
    // locally so the form doesn't feel like a dead end.
    setSaved(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            <p className="text-sm text-foreground/60">Cafe profile and preferences</p>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6 max-w-2xl">
            <p className="text-xs text-foreground/50 bg-muted/50 border border-border rounded-lg p-3">
              These settings aren't wired up to the backend yet — changes here are saved only in this browser session.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cafe Name</label>
                <input
                  name="cafeName"
                  value={formData.cafeName}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Owner Name</label>
                <input
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Opening Time</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Closing Time</label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <input
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <input
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Save size={18} />
                Save Changes
              </button>
              {saved && <span className="text-sm text-green-600">Saved for this session.</span>}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
