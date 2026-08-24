'use client'

import Sidebar from '@/components/sidebar'
import DataTable from '@/components/data-table'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getProducts, deleteProduct } from '@/services/products'
import { formatPrice } from '@/lib/utils-cafe'

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState([])

  const loadProducts = () => {
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products:', err))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(productId)
      loadProducts()
    } catch (err) {
      alert(err.message || 'Failed to delete product (manager login required).')
    }
  }

  // Maps the real backend shape (id, name, category, price, stock,
  // is_veg, is_featured - see backend/models.py ProductOut) into the
  // exact same display row shape this table already rendered (id,
  // name, category, price, stock, status), so DataTable's columns
  // and rendering below are completely untouched. status is derived
  // from `stock` the same way the Streamlit version's
  // getStockStatus() did - the backend itself doesn't send a status
  // string, so this is display-only logic re-created here.
  const displayProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: formatPrice(p.price),
    stock: String(p.stock),
    status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock',
  }))

  const filteredProducts = displayProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
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
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
              <p className="text-muted-foreground mt-1">Manage your cafe menu and inventory</p>
            </div>
            <button className="px-7 h-[44px] w-auto bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 text-[18px]">
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Products Table */}
          <DataTable
            columns={[
              { header: 'Product ID', accessor: 'id' },
              { header: 'Name', accessor: 'name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Price', accessor: 'price' },
              { header: 'Stock', accessor: 'stock', width: 'w-20' },
              { header: 'Status', accessor: 'status' },
            ]}
            data={filteredProducts.map(p => ({
              ...p,
              status: <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.status)}`}>{p.status}</span>
            }))}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-accent">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500"
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
