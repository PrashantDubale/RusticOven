'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Award, Heart, MapPin, LogOut } from 'lucide-react'
import { formatPrice, formatDateTime, getStatusColor, getStatusText } from '@/lib/utils-cafe'
import { getCurrentUser, logout as logoutService } from '@/services/auth'
import { getOrders } from '@/services/orders'
import { getCustomers } from '@/services/customers'
import { getProductImage } from '@/lib/product-images'

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  // The real backend has no "favorite products" field on Customer at
  // all (see backend/models.py CustomerOut) - kept as an empty array
  // rather than fabricating fake favorites, so this section renders
  // its existing empty grid instead of crashing on a missing field.
  const favoriteProducts = []

  useEffect(() => {
    const current = getCurrentUser()
    if (!current) {
      router.push('/login')
      return
    }
    setUser(current)

    // The real backend has no "get customer by logged-in identity"
    // endpoint (auth is just a name/role, with no link to a
    // customers collection record) - fetch all customers and match
    // by name as the best available correlation. If this person
    // never registered via POST /customers/, no match is found and
    // the stats below show sensible zeros instead of crashing.
    getCustomers()
      .then((all) => {
        const match = all.find((c) => c.name === current.name)
        setCustomer(match || { name: current.name, email: '', phone: '', loyalty_points: 0, total_orders: 0, total_spent: 0 })
      })
      .catch((err) => console.error('Failed to load customer record:', err))

    // Similarly, orders only store customer_name, not a customer id -
    // filtering the full order list by name is the same correlation
    // approach used above.
    getOrders()
      .then((all) => setCustomerOrders(all.filter((o) => o.customer_name === current.name).slice(0, 3)))
      .catch((err) => console.error('Failed to load orders:', err))
  }, [router])

  const logout = () => {
    logoutService()
    router.push('/login')
  }

  if (!user || !customer) {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-foreground/60">Welcome back, {customer.name}!</p>
          </div>
          <button
            onClick={logout}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm mb-1">Total Orders</p>
                <p className="text-2xl font-bold">{customer.total_orders}</p>
              </div>
              <Package size={32} className="text-accent/40" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold">{formatPrice(customer.total_spent)}</p>
              </div>
              <div className="text-3xl">₹</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm mb-1">Loyalty Points</p>
                <p className="text-2xl font-bold">{customer.loyalty_points}</p>
              </div>
              <Award size={32} className="text-accent/40" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm mb-1">Favorites</p>
                <p className="text-2xl font-bold">{favoriteProducts.length}</p>
              </div>
              <Heart size={32} className="text-accent/40" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Orders</h2>
                <Link href="#" className="text-accent hover:text-accent/80 text-sm font-medium">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-foreground/60">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-foreground/60 text-xs mb-1">Items</p>
                        <p className="font-semibold">{order.items.length}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60 text-xs mb-1">Amount</p>
                        <p className="font-semibold text-accent">{formatPrice(order.total)}</p>
                      </div>
                      <button className="text-accent hover:text-accent/80 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Products */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favoriteProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all">
                      <div className="bg-accent/10 h-28 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                        <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-accent font-bold text-sm">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-4">Profile Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-foreground/60 mb-1">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Email</p>
                  <p className="font-medium break-all">{customer.email}</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                <button className="w-auto h-[44px] px-6 mt-4 border border-border inline-flex items-center justify-center rounded-lg text-[18px] font-semibold hover:bg-muted transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Loyalty Program */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Award size={20} className="text-accent" />
                Loyalty Program
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Points Balance</p>
                  <p className="text-2xl font-bold text-accent">{customer.loyalty_points}</p>
                </div>
                <div className="bg-background/40 rounded-lg p-3">
                  <p className="text-xs text-foreground/60 mb-2">Points earned from purchases</p>
                  <p className="text-xs text-foreground/60">
                    Every rupee spent = 1 point • Redeem points for discounts
                  </p>
                </div>
                <button className="w-auto h-[44px] px-6 bg-accent text-accent-foreground inline-flex items-center justify-center rounded-lg text-[18px] font-semibold hover:bg-accent/90 transition-colors">
                  Redeem Points
                </button>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Saved Addresses
              </h3>
              <div className="space-y-3">
                <button className="w-full border border-dashed border-border px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                  + Add New Address
                </button>
                <p className="text-xs text-foreground/60 text-center">
                  No saved addresses yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
