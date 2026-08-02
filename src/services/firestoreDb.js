// Firestore adapter — the single backend for the app. Active only when Firebase
// env vars are configured (see config/firebase.js).
import {
  getFirestore, collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc, query, orderBy, where,
} from 'firebase/firestore'
import { app, firebaseEnabled } from '../config/firebase'

// Never initialize Firestore when Firebase isn't configured: `app` is null in
// demo mode, and `getFirestore(null)` throws at module load, blanking the app.
// db.js only routes calls here when firebaseEnabled, so the null instance is
// never used.
const db = firebaseEnabled ? getFirestore(app) : null

export async function list(colName, opts = {}) {
  const ref = collection(db, colName)
  let q = ref
  if (opts.where?.length) {
    q = query(ref, ...opts.where.map((w) => where(w.field, w.op || '==', w.eq)))
  }
  if (opts.sortBy) {
    q = query(q, orderBy(opts.sortBy, opts.sortDir || 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function get(colName, id) {
  const ref = doc(db, colName, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function add(colName, data) {
  const ref = collection(db, colName)
  const res = await addDoc(ref, { ...data, createdAt: new Date().toISOString() })
  return { id: res.id, ...data }
}

export async function update(colName, id, data) {
  const ref = doc(db, colName, id)
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() })
  return { id, ...data }
}

export async function remove(colName, id) {
  await deleteDoc(doc(db, colName, id))
}

export async function set(colName, id, data) {
  const ref = doc(db, colName, id)
  await updateDoc(ref, data)
  return id
}

export function subscribeToDb() {
  return () => {}
}
