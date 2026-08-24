/**
 * services/api.js
 * ----------------
 * Central fetch wrapper every other service file (auth, dashboard,
 * orders, customers) goes through.
 *
 * Matches the REAL backend (backend/routes/auth.py + backend/deps.py):
 * login/signup return a JWT access_token tied to that one account
 * (id, email, role), which we attach as `Authorization: Bearer
 * <token>` on every request. backend/deps.py's require_manager()
 * verifies that token server-side and checks the account's role is
 * "manager" - a customer's token is always rejected on manager-only
 * routes, no matter what. This replaces the old single shared
 * "X-Manager-Passcode" header that every manager typed the same value
 * into.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const USER_KEY = 'cafe-user'   // { id, name, email, role }
const TOKEN_KEY = 'cafe-token' // JWT access_token from /auth/login or /auth/signup

function getStoredUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

function getStoredToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Core request function. Every service function below calls this
 * instead of fetch() directly, so headers, JSON parsing, and error
 * handling are consistent everywhere.
 */
async function request(path, options = {}) {
  const token = getStoredToken()

  const headers = {
    'Content-Type': 'application/json',
    // Sent on every request when logged in (customer or manager) -
    // manager-only routes check the role encoded inside this token
    // server-side; a customer's token simply won't pass that check.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  // FastAPI returns JSON error bodies like {"detail": "..."} on
  // failure - surface that message instead of a generic HTTP error.
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const errorBody = await response.json()
      message = errorBody.detail || errorBody.message || message
    } catch {
      // response body wasn't JSON - fall back to the generic message
    }
    throw new Error(message)
  }

  // Some endpoints (DELETE, etc.) may return no body.
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { API_URL, getStoredUser, getStoredToken, USER_KEY, TOKEN_KEY }
