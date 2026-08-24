/**
 * services/dashboard.js
 * ----------------------
 * REWRITTEN: the real backend has no /dashboard/* routes at all -
 * that was a guessed convention from before I could see the actual
 * backend. The real source for manager-dashboard data is
 * backend/routes/analytics.py and backend/routes/pantry.py:
 *
 *   GET /analytics/today-sales           -> { date, total_sales, orders_count }
 *   GET /analytics/summary               -> { total_sales, orders_count,
 *                                              active_orders, low_stock_count }
 *   GET /analytics/top-products?limit=5  -> [{ name, units_sold, revenue }]
 *   GET /pantry/expiring-soon?days=7     -> pantry items expiring soon
 *   GET /pantry/recent?limit=5           -> most recently added pantry items
 *
 * There is no time-series "sales over the last N days" endpoint on
 * this backend (analytics.py only computes live totals from the
 * orders collection, not a stored daily breakdown) - so a chart like
 * app/analytics/page.jsx's LineChart can't be backed by real data
 * as-is. Either add a new backend endpoint that buckets orders by day
 * (a small addition to analytics.py), or point that specific chart at
 * getTopProducts()'s bar-chart-shaped data instead. Left as-is here
 * rather than guessing which you'd prefer.
 */

import { api } from './api'

export function getTodaySales() {
  return api.get('/analytics/today-sales')
}

export function getSummary() {
  return api.get('/analytics/summary')
}

export function getTopProducts(limit = 5) {
  return api.get(`/analytics/top-products?limit=${limit}`)
}

export function getExpiringPantryItems(days = 7) {
  return api.get(`/pantry/expiring-soon?days=${days}`)
}

export function getRecentPantryItems(limit = 5) {
  return api.get(`/pantry/recent?limit=${limit}`)
}
