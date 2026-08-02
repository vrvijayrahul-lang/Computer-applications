// Unified data API. Pages import from here and never touch Firebase directly,
// so swapping backend adapters is a single import change. The app is
// Firebase-only — this always resolves to the Firestore adapter.
import * as firestoreDb from './firestoreDb'

export const backend = firestoreDb

export const list = (col, opts) => backend.list(col, opts)
export const get = (col, id) => backend.get(col, id)
export const add = (col, data) => backend.add(col, data)
export const update = (col, id, data) => backend.update(col, id, data)
export const remove = (col, id) => backend.remove(col, id)
export const set = (col, id, data) => backend.set(col, id, data)
export const subscribeToDb = (fn) => backend.subscribeToDb(fn)
