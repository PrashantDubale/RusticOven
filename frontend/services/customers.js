/**
 * services/customers.js
 * -----------------------
 * Matches the REAL backend/routes/customers.py. The earlier version's
 * getCustomerOrders() assumed a /customers/:id/orders endpoint that
 * doesn't exist on this backend - removed. If you need a customer's
 * order history, filter the full /orders/ list by customer_name
 * client-side (orders don't store a customer_id, only customer_name -
 * see backend/models.py OrderIn).
 *
 *   GET  /customers/      -> all customers
 *   GET  /customers/:id   -> one customer
 *   POST /customers/      -> register { name, email, phone? }
 *
 * Real customer shape (backend/models.py CustomerOut):
 *   { id, name, email, phone, loyalty_points, total_orders, total_spent }
 */

import { api } from './api'

export function getCustomers() {
  return api.get('/customers/')
}

export function getCustomer(customerId) {
  return api.get(`/customers/${customerId}`)
}

export function createCustomer(customer) {
  return api.post('/customers/', customer)
}
