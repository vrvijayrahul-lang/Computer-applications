// One-off verification + seeding of the real Firebase, mirroring
// src/services/seedFirestore.js. Run with `node seed-verify.mjs` from the
// project root, then delete this file.
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
const { buildSeed, USERS } = await import(pathToFileURL('D:/Computer Application/src/data/seed.js').href)

const env = {}
for (const line of readFileSync('D:/Computer Application/.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const auth = getAuth(app)
const db = getFirestore(app)
console.log(`✓ Firebase project: ${env.VITE_FIREBASE_PROJECT_ID}`)

const DEMO_ACCOUNTS = USERS.slice(0, 4)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 1) Ensure each demo account exists AND has its users/{uid} profile doc.
for (const u of DEMO_ACCOUNTS) {
  let uid
  try {
    const cred = await createUserWithEmailAndPassword(auth, u.email, u.password)
    uid = cred.user.uid
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, u.email, u.password)
      uid = cred.user.uid
    } else { console.error(`✗ auth failed for ${u.email}: ${e.code || e.message}`); process.exit(1) }
  }
  await setDoc(doc(db, 'users', uid), { name: u.name, email: u.email, role: u.role, profileId: u.profileId })
  console.log(`✓ account + profile  ${u.email}  (${u.role})`)
  await sleep(350)
}

// 2) Idempotency guard on data collections (students is a reliable probe).
let alreadySeeded = false
try {
  const snap = await getDocs(collection(db, 'students'))
  alreadySeeded = !snap.empty
} catch { /* proceed */ }

if (alreadySeeded) {
  console.log('✓ data collections already present — skipping writes')
} else {
  const data = buildSeed()
  const docs = []
  for (const [col, list] of Object.entries(data)) {
    if (!list.length || col === 'users') continue
    for (const d of list) docs.push({ col, id: d.id, data: d })
  }
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    for (const { col, id, data: row } of docs.slice(i, i + 400)) batch.set(doc(db, col, id), row)
    await batch.commit()
  }
  console.log(`✓ wrote ${docs.length} docs across ${new Set(docs.map((d) => d.col)).size} collections`)
}

// 3) Read-back verification
const counts = {}
for (const col of ['users', 'students', 'faculty', 'subjects', 'attendance', 'marks', 'timetable', 'notices', 'fees', 'placements']) {
  try {
    const snap = await getDocs(collection(db, col))
    counts[col] = snap.size
  } catch (e) { counts[col] = `read denied: ${e.code}` }
}
console.log('✓ read-back counts:', JSON.stringify(counts))

await signOut(auth)
console.log('✓ done')
