'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { getProduct, getProducts } from '@/services/products'
import { formatPrice } from '@/lib/utils-cafe'
import { getProductImage } from '@/lib/product-images'
import { useCart } from '@/hooks/use-cart'

export default function ProductPage({ params }) {
  const { id } = use(params)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        setProduct(p)
        // Related products: no dedicated backend endpoint for this,
        // so fetch the full list and filter client-side, same
        // approach the original mock version used (just against real
        // data now instead of the static array).
        return getProducts().then((all) => {
          setRelated(all.filter((item) => item.category === p.category && item.id !== p.id).slice(0, 4))
        })
      })
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Product Not Found</h1>
          <Link href="/menu" className="text-accent hover:text-accent/80">
            ← Back to Menu
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    setQuantity(1)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Navigation */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8"
        >
          <ArrowLeft size={18} />
          Back to Menu
        </Link>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-accent/10 rounded-xl h-96 flex items-center justify-center overflow-hidden">
              <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-row flex-nowrap gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 flex-shrink-0 bg-accent/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent/20 transition-colors overflow-hidden"
                >
                  <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  {product.isNew && (
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                      New
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      Best Seller
                    </span>
                  )}
                  {product.is_veg && (
                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      Vegetarian
                    </span>
                  )}
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-foreground/60">{product.description}</p>
            </div>

            {/* Rating & Reviews */}
            {product.rating && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">⭐</span>
                  <span className="text-2xl font-bold">{product.rating}</span>
                </div>
                <div className="text-foreground/60">
                  {product.reviews && `${product.reviews} customer reviews`}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className="bg-card rounded-xl p-6 space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-accent">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground/60">
                      {product.stock > 10
                        ? 'In Stock'
                        : `Only ${product.stock} items left`}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-foreground/60">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              {product.calories && (
                <div className="flex justify-between text-foreground/60">
                  <span>Calories</span>
                  <span className="font-medium text-foreground">{product.calories}</span>
                </div>
              )}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <p className="text-foreground/60 mb-2">Ingredients</p>
                  <p className="text-foreground/80 text-sm">
                    {product.ingredients.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="px-4 py-2 text-foreground/60 hover:text-foreground disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium min-w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock === 0}
                    className="px-4 py-2 text-foreground/60 hover:text-foreground disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`border border-border px-6 py-3 rounded-lg font-medium transition-colors ${
                    isWishlisted
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'hover:bg-card'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <button className="w-full border border-border px-6 py-3 rounded-lg font-medium hover:bg-card transition-colors flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6">More {product.category} Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group"
                >
                  <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-accent/50 transition-all">
                    <div className="bg-accent/10 h-32 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                      <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-2">{item.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-accent font-bold">{formatPrice(item.price)}</span>
                        {item.rating && (
                          <span className="text-sm text-foreground/60">⭐ {item.rating}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
