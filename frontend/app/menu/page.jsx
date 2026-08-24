'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { categories } from '@/lib/mockdata'
import { getProducts } from '@/services/products'
import { formatPrice, searchProducts, filterByCategory, sortProducts } from '@/lib/utils-cafe'
import { Select } from '@/components/ui/select'
import { getProductImage } from '@/lib/product-images'

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  // `categories` above is still the static list from lib/mockdata.js -
  // that's fine to keep as-is (not real "mock data" in the fake-DB-
  // records sense): it's just ['sandwiches','burgers','pizza','fries',
  // 'beverages'], which happens to match the real backend's
  // ProductCategory enum exactly, and there's no dedicated /categories
  // endpoint on the backend anyway. Only the actual product records
  // below are switched from the mock array to a real fetch.
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products:', err))
  }, [])

  const filteredProducts = useMemo(() => {
    let result = products

    // Search
    if (searchQuery) {
      result = searchProducts(result, searchQuery)
    }

    // Category filter
    if (selectedCategory) {
      result = filterByCategory(result, selectedCategory)
    }

    // Sort
    result = sortProducts(result, sortBy)

    return result
  }, [products, searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Menu</h1>
          <p className="text-foreground/60">Browse our complete collection of coffee, pastries, and food items</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Category & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-5 h-[44px] w-auto inline-flex items-center justify-center rounded-lg font-semibold transition-colors text-[18px] ${
                    selectedCategory === ''
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card text-foreground hover:bg-card/80'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 h-[44px] w-auto inline-flex items-center justify-center rounded-lg font-semibold transition-colors text-[18px] ${
                      selectedCategory === cat
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-card text-foreground hover:bg-card/80'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)} ({products.filter((p) => p.category === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                options={[
                  { value: 'featured', label: 'Featured' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Top Rated' },
                ]}
                className="w-full justify-between px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-foreground/60">
          {filteredProducts.length} items {selectedCategory && `in ${categories.find(c => c.id === selectedCategory)?.label}`}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-card rounded-xl overflow-hidden hover:border-accent/50 border border-border transition-all hover:shadow-lg shadow-md-dark">
                  {/* Image */}
                  <div className="bg-accent/10 h-48 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                      {product.isNew && (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">New</span>
                      )}
                      {product.isBestSeller && (
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full font-medium">Best Seller</span>
                      )}
                      {product.isVeg && (
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full font-medium">Veg</span>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <h3 className="font-semibold text-lg text-foreground line-clamp-1">{product.name}</h3>
                      <p className="text-foreground/60 text-base line-clamp-1">{product.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-accent font-bold">{formatPrice(product.price)}</span>
                      <div className="flex items-center gap-2">
                        {product.rating && (
                          <>
                            <span className="text-sm">⭐</span>
                            <span className="text-sm text-foreground/60">{product.rating}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="text-xs text-foreground/50">
                      {product.stock > 10
                        ? '✓ In Stock'
                        : product.stock > 0
                          ? `Only ${product.stock} left`
                          : 'Out of Stock'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">No products found</p>
            <p className="text-foreground/40">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
