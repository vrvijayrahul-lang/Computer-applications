// One-time seeding of Firebase Auth + Firestore with the demo dataset.
// Sources records from data/seed.js. Idempotent, and works under both
// test-mode and auth-required Firestore rules, on first run and on re-runs.
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  getFirestore, collection, getDocs, doc, setDoc, writeBatch,
} from 'firebase/firestore'
import { app, firebaseEnabled } from '../config/firebase'
import { buildSeed, USERS } from '../data/seed'

// The quick-login accounts. Seeding just these four (one per role) keeps the
// Auth setup light enough to avoid Firebase's auth rate limits, and every role
// is linked to seeded data via `profileId` (fac_01, stu_01, ...).
const DEMO_ACCOUNTS = USERS.slice(0, 4)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Best-effort check whether demo data is already in Firestore. An anonymous
// read is denied under auth-required rules, so a failure is reported as
// "not seeded" rather than crashing.
export async function isFirestoreSeeded() {
  if (!firebaseEnabled) return false
  const db = getFirestore(app)
  try {
    const snap = await getDocs(collection(db, 'users'))
    return !snap.empty
  } catch {
    return false
  }
}

// Creates the demo auth accounts and writes the demo collections to Firestore.
// Returns { seeded } — true when data was written this call.
export async function seedFirestore() {
  if (!firebaseEnabled) throw new Error('Firebase is not configured')

  const auth = getAuth(app)
  const db = getFirestore(app)

  // 1) Ensure each demo account exists AND has its `users/{uid}` profile doc.
  //    createUserWithEmailAndPassword only signs in for brand-new accounts, so
  //    existing accounts are signed in explicitly to recover their uid. This
  //    keeps the writes authenticated under auth-required rules even on re-runs.
  //    A short pause between accounts avoids Firebase's auth rate limiter.
  for (const u of DEMO_ACCOUNTS) {
    let uid
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password)
      uid = cred.user.uid
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, u.email, u.password)
        uid = cred.user.uid
      } else {
        throw e
      }
    }
    await setDoc(doc(db, 'users', uid), {
      name: u.name,
      email: u.email,
      role: u.role,
      profileId: u.profileId,
    })
    await sleep(350)
  }

  // 2) Idempotency guard on the data collections — `students` is a reliable
  //    probe for "demo data already written".
  let alreadySeeded = false
  try {
    const snap = await getDocs(collection(db, 'students'))
    alreadySeeded = !snap.empty
  } catch { /* rules may deny reads; write anyway */ }

  let wrote = false
  if (!alreadySeeded) {
    // 3) Data collections, written in batches of ≤400 (writeBatch limit is 500).
    //    `users` is excluded — its docs are written above with real Auth uids.
    const data = buildSeed()
    const docs = []
    for (const [col, list] of Object.entries(data)) {
      if (!list.length || col === 'users') continue
      for (const d of list) docs.push({ col, id: d.id, data: d })
    }
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db)
      for (const { col, id, data: row } of docs.slice(i, i + 400)) {
        batch.set(doc(db, col, id), row)
      }
      await batch.commit()
    }
    wrote = true
  }

  // Seeding leaves the last account signed in on the default auth instance;
  // sign back out so the visitor stays on the login screen.
  await signOut(auth)

  return { seeded: wrote }
}
