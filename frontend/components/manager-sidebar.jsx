'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Boxes,
} from 'lucide-react'
import { useState } from 'react'
import { logout as logoutService } from '@/services/auth'

const menuItems = [
  {
    label: 'Overview',
    href: '/dashboard/manager',
    icon: LayoutDashboard,
  },
  {
    label: 'Analytics',
    href: '/dashboard/manager/analytics',
    icon: BarChart3,
  },
  {
    label: 'Orders',
    href: '/dashboard/manager/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Inventory',
    href: '/dashboard/manager/inventory',
    icon: Boxes,
  },
  {
    label: 'Expiry Tracking',
    href: '/dashboard/manager/expiry',
    icon: AlertCircle,
  },
  {
    label: 'Products',
    href: '/dashboard/manager/products',
    icon: Package,
  },
  {
    label: 'Staff',
    href: '/dashboard/manager/staff',
    icon: Users,
  },
  {
    label: 'Purchases',
    href: '/dashboard/manager/purchases',
    icon: ShoppingCart,
  },
  {
    label: 'Reports',
    href: '/dashboard/manager/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/dashboard/manager/settings',
    icon: Settings,
  },
]

export function ManagerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const logout = () => {
    logoutService()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Toggle - only rendered while closed; aligned with the page header title */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-[calc(65px+0.75rem)] left-4 z-40 p-2 hover:bg-muted rounded-lg"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[65px] h-[calc(100vh-65px)] bg-muted border-r border-border overflow-y-auto overflow-x-hidden transition-all duration-300 z-30 ${
          isOpen ? 'w-72 max-w-[85vw] md:w-64' : 'w-0 md:w-64'
        }`}
      >
        <div className="p-5 sm:p-6 space-y-8 w-72 md:w-64">
          {/* Logo/Brand */}
          <div className={`${isOpen ? 'flex' : 'hidden'} md:flex items-center justify-between gap-2`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 coffee-gradient rounded-lg flex-shrink-0" />
              <span className="font-bold text-lg whitespace-nowrap">Manager</span>
            </div>
            {/* Close button lives in the same flex row as the logo, so it's
                naturally centered against it instead of guessing a fixed offset */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 hover:bg-muted/70 rounded-lg text-foreground/70 hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-base whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="pt-6 border-t border-border">
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted/50 w-full transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium text-base">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
