// One-time seeding of Firebase Auth + Firestore with the demo dataset.
// Mirrors what mockDb does in demo mode (data/seed.js) so the deployed app is
// usable the moment Firebase is wired up. Idempotent, and works under both
// test-mode and auth-required Firestore rules.
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  getFirestore, collection, getDocs, doc, setDoc, writeBatch,
} from 'firebase/firestore'
import { app, firebaseEnabled } from '../config/firebase'
import { buildSeed, USERS } from '../data/seed'

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
// Returns { seeded, accounts } where accounts is the list usable for quick login.
export async function seedFirestore() {
  if (!firebaseEnabled) throw new Error('Firebase is not configured')

  const auth = getAuth(app)
  const db = getFirestore(app)

  // 1) Auth accounts + `users/{uid}` profile docs (never store passwords in
  //    Firestore). Creating the accounts signs the app in as the last-created
  //    account, which also satisfies auth-required rules for the writes below.
  const accounts = []
  for (const u of USERS) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: u.name,
        email: u.email,
        role: u.role,
        profileId: u.profileId,
      })
      accounts.push({ role: u.role, name: u.name, email: u.email, password: u.password })
    } catch (e) {
      // Account already exists (e.g. a previous run) — link it instead.
      if (e.code !== 'auth/email-already-in-use') throw e
    }
  }

  // 2) Idempotency guard — only seed the data collections when Firestore is
  //    genuinely empty. Best-effort: if the read is denied we fall through and
  //    write anyway; setDoc is idempotent, so a re-run only re-writes the same
  //    demo records.
  try {
    const snap = await getDocs(collection(db, 'users'))
    if (!snap.empty && accounts.length === 0) return { seeded: false, accounts }
  } catch { /* rules may deny reads; proceed to write */ }

  // 3) Data collections, written in batches of ≤400 (writeBatch limit is 500).
  const data = buildSeed()
  const docs = []
  for (const [col, list] of Object.entries(data)) {
    if (!list.length) continue
    for (const d of list) docs.push({ col, id: d.id, data: d })
  }
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    for (const { col, id, data: row } of docs.slice(i, i + 400)) {
      batch.set(doc(db, col, id), row)
    }
    await batch.commit()
  }

  // Seeding signs the last-created account into the default auth instance;
  // sign back out so the visitor stays on the login screen.
  await signOut(auth)

  return { seeded: true, accounts }
}
