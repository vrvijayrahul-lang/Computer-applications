// localStorage-backed demo store. Mirrors the same API as the Firestore
// adapter (db.js) so pages never care which backend is active.
import { buildSeed } from '../data/seed'

const STORAGE_KEY = 'cms_db_v2'
const SESSION_KEY = 'cms_session_v2'

const listeners = new Set()
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const emit = () => listeners.forEach((fn) => fn())

function genId() {
  return (crypto.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`)
}

function readDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const db = JSON.parse(raw)
    if (!db || db.__v !== 2) return null
    return db
  } catch { return null }
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function ensureDb() {
  let db = readDb()
  if (!db) {
    db = { __v: 2, ...buildSeed() }
    writeDb(db)
  }
  return db
}

export function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY)
  emit()
}

function sortDocs(docs, opts) {
  if (!docs.length) return docs
  const key = opts?.sortBy || 'createdAt'
  const dir = opts?.sortDir || 'desc'
  const hasKey = docs.some((d) => d[key] !== undefined)
  if (!hasKey) return docs
  return docs.slice().sort((a, b) => {
    const av = a[key]; const bv = b[key]
    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1 : -1
    return 0
  })
}

export async function list(collection, opts = {}) {
  const db = ensureDb()
  let docs = (db[collection] || []).slice()
  if (opts.where) {
    for (const { field, eq } of opts.where) {
      docs = docs.filter((d) => String(d[field]) === String(eq))
    }
  }
  if (opts.ids) docs = docs.filter((d) => opts.ids.includes(d.id))
  return sortDocs(docs, opts)
}

export async function get(collection, id) {
  const db = ensureDb()
  return (db[collection] || []).find((d) => d.id === id) || null
}

export async function add(collection, data) {
  const db = ensureDb()
  const now = new Date().toISOString()
  const doc = { id: genId(), ...data, createdAt: now, updatedAt: now }
  db[collection] = db[collection] || []
  db[collection].push(doc)
  writeDb(db); emit()
  return doc
}

export async function update(collection, id, data) {
  const db = ensureDb()
  const arr = db[collection] || []
  const idx = arr.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error(`${collection}/${id} not found`)
  arr[idx] = { ...arr[idx], ...data, updatedAt: new Date().toISOString() }
  writeDb(db); emit()
  return arr[idx]
}

export async function remove(collection, id) {
  const db = ensureDb()
  db[collection] = (db[collection] || []).filter((d) => d.id !== id)
  writeDb(db); emit()
}

export async function set(collection, id, data) {
  const db = ensureDb()
  const now = new Date().toISOString()
  db[collection] = db[collection] || []
  const idx = db[collection].findIndex((d) => d.id === id)
  if (idx === -1) db[collection].push({ id, ...data, createdAt: now, updatedAt: now })
  else db[collection][idx] = { ...data, id, updatedAt: now }
  writeDb(db); emit()
  return id
}

// ---- Demo auth ----
export async function demoLogin(email, password) {
  const db = ensureDb()
  const user = (db.users || []).find(
    (u) => String(u.email).toLowerCase() === String(email).toLowerCase(),
  )
  if (!user) throw new Error('No account found for this email')
  if (user.password !== password) throw new Error('Incorrect password')
  const { password: _pw, ...safe } = user
  const session = { ...safe, backend: 'demo' }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  emit()
  return session
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  emit()
}

export const subscribeToDb = subscribe
