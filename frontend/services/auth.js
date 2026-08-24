/**
 * services/auth.js
 * -----------------
 * Matches the REAL backend/routes/auth.py exactly:
 *   POST /auth/signup { name, email, password } -> { access_token, user }
 *   POST /auth/login  { email, password }        -> { access_token, user }
 *
 * Every account (customer or manager) is a real row in the database
 * with a bcrypt-hashed password - there's no shared passcode anymore.
 * Manager accounts aren't created through signup(); see
 * backend/seed_admin.py for how those get created.
 */

import { api } from './api'
import { USER_KEY, TOKEN_KEY } from './api'

function storeSession({ access_token, user }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, access_token)
  }
  return user
}

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password })
  return storeSession(data)
}

export async function signup(name, email, password) {
  const data = await api.post('/auth/signup', { name, email, password })
  return storeSession(data)
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}
