/**
 * services/orders.js
 * -------------------
 * Rewritten to match the REAL backend/routes/orders.py exactly
 * (the earlier version assumed PATCH for status updates and a DELETE
 * endpoint - neither exists; status updates are PUT, and there's no
 * order-cancellation-by-delete endpoint at all, only a status change
 * to "cancelled"):
 *
 *   GET  /orders/            -> all orders, newest first
 *   GET  /orders/:id         -> one order
 *   POST /orders/            -> create { customer_name, items, notes?,
 *                                order_type?, table_number? }
 *   PUT  /orders/:id/status  -> { status } - subtotal/tax/total are
 *                                calculated server-side, never sent
 *                                by the client.
 *
 * Real order shape (backend/models.py OrderOut):
 *   { id, customer_name, items: [{product_id, name, price, quantity}],
 *     subtotal, tax, total, status, notes, order_type, table_number,
 *     created_at }
 * status is one of: pending | preparing | ready | delivered | cancelled
 */

import { api } from './api'

export function getOrders() {
  return api.get('/orders/')
}

export function getOrder(orderId) {
  return api.get(`/orders/${orderId}`)
}

export function createOrder(order) {
  return api.post('/orders/', order)
}

export function updateOrderStatus(orderId, status) {
  return api.put(`/orders/${orderId}/status`, { status })
}
