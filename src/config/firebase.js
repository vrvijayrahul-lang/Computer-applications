import { initializeApp } from 'firebase/app'

// Populate these in a .env file to connect to your Firebase project.
// See README.md -> "Connect Firebase".
const env = import.meta.env
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

// The app is Firebase-only. `firebaseEnabled` still guards Firestore init so
// a missing .env doesn't crash at module load (getFirestore(null) throws).
export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = firebaseEnabled ? initializeApp(firebaseConfig) : null
