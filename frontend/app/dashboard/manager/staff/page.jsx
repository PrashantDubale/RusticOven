'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { DataTable } from '@/components/ui/data-table'
import { Plus, Search, Edit2, X } from 'lucide-react'
import { api } from '@/services/api'
import { formatPrice } from '@/lib/utils-cafe'

// Matches backend/routes/staff.py exactly:
//   GET  /staff/            -> list all staff
//   POST /staff/            -> add a new staff member (manager-only)
//   PUT  /staff/{staff_id}  -> edit an existing staff member (manager-only)
// No dedicated services/staff.js existed yet, so calling api directly here.
const getStaff = () => api.get('/staff/')
const createStaff = (staff) => api.post('/staff/', staff)
const updateStaff = (id, updates) => api.put(`/staff/${id}`, updates)

const emptyForm = { employee_id: '', name: '', position: '', email: '', phone: '', salary: '' }

export default function ManagerStaff() {
  const [searchTerm, setSearchTerm] = useState('')
  const [staff, setStaff] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadStaff = () => {
    getStaff()
      .then(setStaff)
      .catch((err) => console.error('Failed to load staff:', err))
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (member) => {
    setEditingId(member.id)
    setForm({
      employee_id: member.employee_id,
      name: member.name,
      position: member.position,
      email: member.email,
      phone: member.phone,
      salary: String(member.salary),
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await updateStaff(editingId, {
          name: form.name,
          position: form.position,
          email: form.email,
          phone: form.phone,
          salary: parseFloat(form.salary) || 0,
        })
      } else {
        await createStaff({
          employee_id: form.employee_id,
          name: form.name,
          position: form.position,
          email: form.email,
          phone: form.phone,
          salary: parseFloat(form.salary) || 0,
        })
      }
      setShowForm(false)
      loadStaff()
    } catch (err) {
      setError(err.message || 'Failed to save staff member (manager login required).')
    } finally {
      setSaving(false)
    }
  }

  const filtered = staff.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">Staff</h1>
              <p className="text-sm text-foreground/60">Manage your team</p>
            </div>
            <button
              onClick={openAdd}
              className="px-3 sm:px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 text-base sm:text-lg flex-shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              Add Staff
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          {showForm && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                <button onClick={() => setShowForm(false)} className="text-foreground/50 hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Employee ID</label>
                  <input
                    required
                    disabled={!!editingId}
                    value={form.employee_id}
                    onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <input
                    required
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Salary</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-lg">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold text-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search staff by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent"
            />
          </div>

          <DataTable
            columns={[
              { key: 'employee_id', label: 'Employee ID' },
              { key: 'name', label: 'Name' },
              { key: 'position', label: 'Position' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'salary', label: 'Salary', render: (s) => formatPrice(s) },
            ]}
            data={filtered}
            actions={(row) => (
              <button onClick={() => openEdit(row)} className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-accent">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          />
        </div>
      </main>
    </div>
  )
}
