'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/manager-sidebar'
import { DataTable } from '@/components/ui/data-table'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products'
import { formatPrice } from '@/lib/utils-cafe'

const CATEGORIES = ['sandwiches', 'burgers', 'pizza', 'fries', 'beverages']
const CATEGORY_ITEMS = CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))

const emptyForm = { name: '', description: '', category: 'pizza', price: '', stock: '', is_veg: true, is_featured: false }

export default function ManagerProducts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadProducts = () => {
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products:', err))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      is_veg: product.is_veg,
      is_featured: product.is_featured,
    })
    setError('')
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(productId)
      loadProducts()
    } catch (err) {
      alert(err.message || 'Failed to delete product (manager login required).')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        is_veg: form.is_veg,
        is_featured: form.is_featured,
      }
      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }
      setShowForm(false)
      loadProducts()
    } catch (err) {
      setError(err.message || 'Failed to save product (manager login required).')
    } finally {
      setSaving(false)
    }
  }

  const displayProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((p) => ({
      ...p,
      priceDisplay: formatPrice(p.price),
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock',
    }))

  const statusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-500/10 text-green-500'
      case 'Low Stock':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-red-500/10 text-red-500'
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-[65px] z-10 bg-card border-b border-border pl-16 pr-4 sm:pr-6 md:pl-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">Products</h1>
              <p className="text-sm text-foreground/60">Manage your menu and stock</p>
            </div>
            <button
              onClick={openAdd}
              className="px-3 sm:px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 text-base sm:text-lg flex-shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              Add Product
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          {showForm && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)} className="text-foreground/50 hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={form.category}
                    onValueChange={(category) => setForm({ ...form, category })}
                    options={CATEGORY_ITEMS}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex items-center gap-6 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_veg} onChange={(e) => setForm({ ...form, is_veg: e.target.checked })} />
                    Vegetarian
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    />
                    Featured
                  </label>
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
                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent"
            />
          </div>

          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category' },
              { key: 'priceDisplay', label: 'Price' },
              { key: 'stock', label: 'Stock' },
              {
                key: 'status',
                label: 'Status',
                render: (status) => (
                  <span className={`px-3 py-1 rounded-full text-base font-semibold ${statusColor(status)}`}>{status}</span>
                ),
              },
            ]}
            data={displayProducts}
            actions={(row) => (
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => openEdit(row)} className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-accent">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        </div>
      </main>
    </div>
  )
}
