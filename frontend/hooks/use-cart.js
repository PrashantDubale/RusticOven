'use client'

import { useState, useEffect } from 'react'

export function useCart() {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cafe-cart')
    if (saved) {
      try {
        setCartItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load cart from localStorage', e)
      }
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cafe-cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isLoading])

  const addItem = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id)
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          price: product.price,
        },
      ]
    })
  }

  const removeItem = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
  }

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  return {
    items: cartItems,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total: getTotal(),
    itemCount: getItemCount(),
  }
}
