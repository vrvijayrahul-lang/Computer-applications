import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuth, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { app, firebaseEnabled } from '../config/firebase'
import { get as dbGet, upsert as dbUpsert } from '../services/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
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
      const auth = getAuth(app)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      setUser(await hydrateProfile(cred.user.uid, cred.user.email))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.code ? e.message.replace(/^auth\//, '') : e.message }
    } finally {
      setLoading(false)
    }
  }, [hydrateProfile])

  const logout = useCallback(() => {
    if (firebaseEnabled) signOut(getAuth(app)).catch(() => {})
    setUser(null)
  }, [])

  // Student self-registration. Creates the Auth account, then the student
  // profile and users doc (linked via profileId = uid). Rolls the auth account
  // back if the profile writes fail so we don't leave an orphaned login.
  const signUp = useCallback(async ({ name, rollNo, email, password, program, semester, section }) => {
    setLoading(true)
    try {
      const auth = getAuth(app)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      try {
        await dbUpsert('students', uid, {
          name, rollNo, email, program, semester: Number(semester), section,
          admissionYear: new Date().getFullYear(), status: 'active',
          phone: '', address: '', gender: '', dob: '',
        })
        await dbUpsert('users', uid, { name, email, role: 'student', profileId: uid })
      } catch (e) {
        await deleteUser(cred.user).catch(() => {})
        throw e
      }
      setUser(await hydrateProfile(uid, email))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.code ? e.message.replace(/^auth\//, '') : e.message }
    } finally {
      setLoading(false)
    }
  }, [hydrateProfile])

  return (
    <AuthContext.Provider value={{ user, ready, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
