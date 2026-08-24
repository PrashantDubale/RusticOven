/**
 * services/products.js
 * ----------------------
 * New file (wasn't in the original migration) - the real backend has
 * a dedicated /products collection, and app/menu/page.jsx, app/page.jsx
 * (Home's featured products), app/products/page.jsx (manager admin),
 * and app/products/[id]/page.jsx all need it. Matches
 * backend/routes/products.py exactly:
 *
 *   GET    /products/           -> all products
 *   GET    /products/featured   -> only is_featured: true
 *   GET    /products/:id        -> one product
 *   POST   /products/           -> create (manager-only)
 *   PUT    /products/:id        -> update (manager-only)
 *   DELETE /products/:id        -> delete (manager-only)
 *
 * Real product shape (backend/models.py ProductOut) - note this is
 * NOT the same shape the v0 mock data used:
 *   { id, name, description, category, price, image, is_veg, stock,
 *     is_featured }
 * category is one of: sandwiches | burgers | pizza | fries | beverages
 * (the mock data's coffee/pastries/desserts/snacks categories don't
 * exist on this backend). There's no `rating` or `createdAt` field.
 */

import { api } from './api'

export function getProducts() {
  return api.get('/products/')
}

export function getFeaturedProducts() {
  return api.get('/products/featured')
}

export function getProduct(productId) {
  return api.get(`/products/${productId}`)
}

export function createProduct(product) {
  return api.post('/products/', product)
}

export function updateProduct(productId, updates) {
  return api.put(`/products/${productId}`, updates)
}

export function deleteProduct(productId) {
  return api.delete(`/products/${productId}`)
}
