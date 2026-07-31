// Unified data API. Pages import from here and never touch the backend
// directly, so switching between the demo store and real Firestore is just a
// matter of configuring env vars.
import { firebaseEnabled, BACKEND_MODE } from '../config/firebase'
import * as mockDb from './mockDb'
import * as firestoreDb from './firestoreDb'

export const backend = firebaseEnabled ? firestoreDb : mockDb
export const backendMode = BACKEND_MODE

export const list = (col, opts) => backend.list(col, opts)
export const get = (col, id) => backend.get(col, id)
export const add = (col, data) => backend.add(col, data)
export const update = (col, id, data) => backend.update(col, id, data)
export const remove = (col, id) => backend.remove(col, id)
export const set = (col, id, data) => backend.set(col, id, data)
export const subscribeToDb = (fn) => backend.subscribeToDb(fn)

export const resetDemoData = () => {
  if (!firebaseEnabled) mockDb.resetDatabase()
}
