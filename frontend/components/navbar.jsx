'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { getCurrentUser, logout as logoutService } from '@/services/auth'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { itemCount } = useCart()
  // Replaces the old hooks/use-auth.js mock hook (a separate,
  // disconnected fake 'cafe-auth' localStorage flag) with the real
  // logged-in user from services/auth.js - without this, someone
  // could actually log in via the real /login page and the navbar
  // would still show "Login" as if nothing happened, since it was
  // reading a completely different piece of state. Read in useEffect
  // (not directly in render) because localStorage isn't available
  // during server-side rendering, and reading it directly would
  // cause a hydration mismatch between server and client output.
  const [user, setUser] = useState(null)
  useEffect(() => {
    setUser(getCurrentUser())
  }, [])
  const isAuthenticated = !!user
  const logout = () => {
    logoutService()
    setUser(null)
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-md">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center h-[65px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/rustic-oven-logo.png"
              alt="Rustic Oven"
              className="h-[50px] w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium text-[18px]">
              Home
            </Link>
            <Link href="/menu" className="text-foreground hover:text-primary transition-colors font-medium text-[18px]">
              Menu
            </Link>
            <Link href="/menu?featured=true" className="text-foreground hover:text-primary transition-colors font-medium text-[18px]">
              Featured
            </Link>
            <Link href="/#about" className="text-foreground hover:text-primary transition-colors font-medium text-[18px]">
              About
            </Link>
            <Link href="/#contact" className="text-foreground hover:text-primary transition-colors font-medium text-[18px]">
              Contact
            </Link>
            {isAuthenticated && user?.role === 'manager' && (
              <Link href="/dashboard/manager" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2 font-medium">
                <LayoutDashboard size={18} />
                Manager
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Cart */}
            <Link href="/cart" className="relative hover:text-accent transition-colors">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-2 text-foreground hover:text-accent transition-colors"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <Link href="/login" className="px-5 h-[44px] w-auto inline-flex items-center justify-center bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-[18px]">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-3">
            <Link href="/" className="block text-foreground/80 hover:text-primary transition-colors font-medium text-[18px]" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/menu" className="block text-foreground/80 hover:text-primary transition-colors font-medium text-[18px]" onClick={() => setIsOpen(false)}>
              Menu
            </Link>
            <Link href="/menu?featured=true" className="block text-foreground/80 hover:text-primary transition-colors font-medium text-[18px]" onClick={() => setIsOpen(false)}>
              Featured
            </Link>
            <Link href="/#about" className="block text-foreground/80 hover:text-primary transition-colors font-medium text-[18px]" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link href="/#contact" className="block text-foreground/80 hover:text-primary transition-colors font-medium text-[18px]" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
            {isAuthenticated && user?.role === 'manager' && (
              <Link href="/dashboard/manager" className="block text-foreground/80 hover:text-primary transition-colors font-medium text-[18px]" onClick={() => setIsOpen(false)}>
                Manager Dashboard
              </Link>
            )}
            <div className="border-t border-border pt-4 mt-4">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <Link href="/login" className="px-5 h-[44px] w-auto inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-[18px]" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
