// Firestore adapter — same API shape as mockDb. Active only when Firebase
// env vars are configured (see config/firebase.js).
import {
  getFirestore, collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc, query, orderBy, where,
} from 'firebase/firestore'
import { app } from '../config/firebase'

const db = getFirestore(app)

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
