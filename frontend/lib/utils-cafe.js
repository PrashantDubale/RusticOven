/**
 * Format price in Indian Rupees
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

/**
 * Format date in Indian locale
 */
export function formatDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time
 */
export function formatTime(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate tax on amount (18% GST)
 */
export function calculateTax(amount, taxRate = 0.18) {
  return parseFloat((amount * taxRate).toFixed(2))
}

/**
 * Calculate total with tax
 */
export function calculateTotal(subtotal, taxRate = 0.18) {
  const tax = calculateTax(subtotal, taxRate)
  return parseFloat((subtotal + tax).toFixed(2))
}

/**
 * Get order status color
 */
export function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-700'
    case 'preparing':
      return 'bg-blue-500/10 text-blue-700'
    case 'ready':
      return 'bg-green-500/10 text-green-700'
    case 'delivered':
      return 'bg-emerald-500/10 text-emerald-700'
    case 'cancelled':
      return 'bg-red-500/10 text-red-700'
    default:
      return 'bg-gray-500/10 text-gray-700'
  }
}

/**
 * Get status badge icon/text
 */
export function getStatusText(status) {
  const statusMap = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return statusMap[status] || status
}

/**
 * Get product category display name
 */
export function getCategoryName(category) {
  const categoryMap = {
    coffee: 'Coffee',
    pastries: 'Pastries',
    sandwiches: 'Sandwiches',
    desserts: 'Desserts',
    beverages: 'Beverages',
    snacks: 'Snacks',
  }
  return categoryMap[category] || category
}

/**
 * Get stock status
 */
export function getStockStatus(stock, minimum = 5) {
  if (stock === 0) return 'out-of-stock'
  if (stock <= minimum) return 'low-stock'
  return 'in-stock'
}

/**
 * Get stock status color
 */
export function getStockStatusColor(status) {
  switch (status) {
    case 'in-stock':
      return 'text-green-600 bg-green-50'
    case 'low-stock':
      return 'text-yellow-600 bg-yellow-50'
    case 'out-of-stock':
      return 'text-red-600 bg-red-50'
  }
}

/**
 * Get loyalty points value in rupees
 */
export function getLoyaltyValue(points) {
  // 1 point = 0.50 rupees
  return (points * 0.5)
}

/**
 * Calculate discount from loyalty points
 */
export function getDiscountFromLoyalty(points, maxDiscount = 500) {
  const discount = getLoyaltyValue(points)
  return Math.min(discount, maxDiscount)
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num) {
  return num.toLocaleString('en-IN')
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return 0
  return parseFloat((((current - previous) / previous) * 100).toFixed(1))
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, length = 50) {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Search products by name or description
 */
export function searchProducts(products, query) {
  const lowerQuery = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery),
  )
}

/**
 * Filter products by category
 */
export function filterByCategory(products, category) {
  if (!category) return products
  return products.filter((p) => p.category === category)
}

/**
 * Sort products
 */
export function sortProducts(products, sortBy) {
  const sorted = [...products]
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    default:
      return sorted
  }
}

/**
 * Generate order ID
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `ORD-${random}${timestamp}`
}
