'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { formatPrice, calculateTax, calculateTotal } from '@/lib/utils-cafe'
import { createOrder } from '@/services/orders'
import { getCurrentUser } from '@/services/auth'
import { getProductImage } from '@/lib/product-images'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, isLoading } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  // "Proceed to Checkout" was a static button with no handler in the
  // original v0 design (no separate checkout page/route exists in
  // this project). Wired directly to the real POST /orders/ endpoint
  // rather than inventing a new checkout page/route not in the
  // original design. subtotal/tax/total are NOT sent - the backend
  // calculates those itself from the items list (see
  // backend/routes/orders.py) and would ignore/ reject a client-sent
  // total anyway.
  const handleCheckout = async () => {
    const user = getCurrentUser()
    setIsSubmitting(true)
    setCheckoutError('')
    try {
      await createOrder({
        customer_name: user?.name || 'Guest',
        items: items.map((item) => ({
          product_id: item.productId,
          name: item.product?.name || `Product ${item.productId}`,
          price: item.price,
          quantity: item.quantity,
        })),
        order_type: 'takeaway',
      })
      clearCart()
      router.push('/')
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">☕</div>
      </div>
    )
  }

  const tax = calculateTax(total)
  const totalWithTax = calculateTotal(total)

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="text-6xl">🛒</div>
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-foreground/60">Add items from our menu to get started</p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90"
            >
              Browse Menu <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg p-4 md:p-6"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="font-semibold hover:text-accent transition-colors"
                          >
                            {item.product?.name || `Product ${item.productId}`}
                          </Link>
                          <p className="text-sm text-foreground/60 line-clamp-1">
                            {item.product?.description}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-foreground/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground/60">
                            {formatPrice(item.price)} each
                          </p>
                          <p className="font-bold text-lg text-accent">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-foreground/60 hover:text-foreground transition-colors text-sm"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-3 border-b border-border pb-6">
                  <div className="flex justify-between text-foreground/60">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Taxes (18% GST)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Delivery</span>
                    <span className="text-green-400">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-accent">
                    {formatPrice(totalWithTax)}
                  </span>
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button className="bg-background border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">
                      Apply
                    </button>
                  </div>
                </div>

                {checkoutError && (
                  <p className="text-red-500 text-sm">{checkoutError}</p>
                )}

                {/* Checkout */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-auto h-[44px] px-6 inline-flex items-center justify-center bg-accent text-accent-foreground text-[18px] rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Placing Order...' : 'Proceed to Checkout'}
                </button>

                <Link
                  href="/menu"
                  className="w-auto h-[44px] px-6 inline-flex items-center justify-center border border-border text-[18px] rounded-lg font-semibold hover:bg-card transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
