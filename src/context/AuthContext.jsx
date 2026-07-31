import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { app, firebaseEnabled } from '../config/firebase'
import { demoLogin, getSession, clearSession } from '../services/mockDb'
import { get as dbGet } from '../services/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (firebaseEnabled ? null : getSession()))
  const [ready, setReady] = useState(!firebaseEnabled)
  const [loading, setLoading] = useState(false)

  const hydrateProfile = useCallback(async (uid, email) => {
    try {
      const profile = await dbGet('users', uid)
      return {
        uid,
        email,
        name: profile?.name || email?.split('@')[0],
        role: profile?.role || 'student',
        profileId: profile?.profileId || null,
        backend: 'firebase',
      }
    } catch {
      return { uid, email, name: email?.split('@')[0], role: 'student', profileId: null, backend: 'firebase' }
    }
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return
    const auth = getAuth(app)
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) setUser(await hydrateProfile(u.uid, u.email))
      else setUser(null)
      setReady(true)
    })
    return unsub
  }, [firebaseEnabled, hydrateProfile])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      if (firebaseEnabled) {
        const auth = getAuth(app)
        const cred = await signInWithEmailAndPassword(auth, email, password)
        setUser(await hydrateProfile(cred.user.uid, cred.user.email))
      } else {
        setUser(await demoLogin(email, password))
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.code ? e.message.replace(/^auth\//, '') : e.message }
    } finally {
      setLoading(false)
    }
  }, [firebaseEnabled, hydrateProfile])

  const logout = useCallback(() => {
    if (firebaseEnabled) signOut(getAuth(app)).catch(() => {})
    clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
