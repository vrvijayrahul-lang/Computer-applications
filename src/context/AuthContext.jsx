import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuth, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { app, firebaseEnabled } from '../config/firebase'
import { get as dbGet, upsert as dbUpsert, list as dbList } from '../services/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!firebaseEnabled)
  const [loading, setLoading] = useState(false)

  const hydrateProfile = useCallback(async (uid, email) => {
    try {
      const profile = await dbGet('users', uid)
      const role = profile?.role || 'student'
      const profileId = profile?.profileId || null
      // A "pending" faculty account is gated at the app until an HOD/superadmin
      // approves it, so we surface the linked profile doc's status here.
      let profileStatus = 'active'
      if (profileId && (role === 'faculty' || role === 'hod')) {
        try {
          const detail = await dbGet('faculty', profileId)
          profileStatus = detail?.status || 'active'
        } catch { /* keep active if the profile doc is missing or unreadable */ }
      }
      return { uid, email, name: profile?.name || email?.split('@')[0], role, profileId, profileStatus, backend: 'firebase' }
    } catch {
      return { uid, email, name: email?.split('@')[0], role: 'student', profileId: null, profileStatus: 'active', backend: 'firebase' }
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

  // Student / faculty self-registration. Creates the Auth account, then the
  // matching profile (students or faculty) and users doc (linked via
  // profileId = uid). Rolls the auth account back if the profile writes fail
  // so we don't leave an orphaned login.
  const signUp = useCallback(async ({ role = 'student', name, email, password, ...profile }) => {
    setLoading(true)
    try {
      const auth = getAuth(app)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      try {
        if (role === 'faculty') {
          await dbUpsert('faculty', uid, {
            name,
            email,
            empId: profile.empId || '',
            designation: profile.designation || '',
            qualification: profile.qualification || '',
            specialization: profile.specialization || '',
            departmentId: 'dept_ca',
            subjects: [],
            experience: 0,
            // New faculty accounts require HOD/superadmin approval before use.
            status: 'pending',
            phone: '', address: '', gender: '', dob: '',
          })
        } else {
          await dbUpsert('students', uid, {
            name,
            rollNo: profile.rollNo,
            email,
            program: profile.program,
            semester: Number(profile.semester),
            section: profile.section,
            admissionYear: new Date().getFullYear(),
            status: 'active',
            phone: '', address: '', gender: '', dob: '',
          })
        }
        await dbUpsert('users', uid, { name, email, role, profileId: uid })
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

  // Google sign-in. First time a Google account appears, it is provisioned a
  // users/{uid} doc. Role is resolved by uid first, then by matching the email
  // against an existing account (so e.g. the superadmin keeps /admin), else it
  // defaults to student.
  const googleLogin = useCallback(async () => {
    setLoading(true)
    try {
      const auth = getAuth(app)
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      const u = cred.user
      const uid = u.uid
      const email = u.email || ''
      let profile = null
      try { profile = await dbGet('users', uid) } catch { /* ignore */ }
      let role = profile?.role || 'student'
      let profileId = profile?.profileId || null
      let name = profile?.name || u.displayName || email.split('@')[0]
      if (!profile) {
        try {
          const matches = await dbList('users', { where: [{ field: 'email', op: '==', eq: email }] })
          if (matches.length) {
            role = matches[0].role || 'student'
            profileId = matches[0].profileId || null
            name = matches[0].name || name
          }
        } catch { /* rules may block; keep defaults */ }
        await dbUpsert('users', uid, { name, email, role, profileId })
      }
      setUser({ uid, email, name, role, profileId, backend: 'firebase' })
      return { ok: true, role }
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return { ok: false, error: 'Sign-in cancelled' }
      return { ok: false, error: e.code ? e.message.replace(/^auth\//, '') : e.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sends Firebase's password-reset email for an address.
  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(getAuth(app), email)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.code ? e.message.replace(/^auth\//, '') : e.message }
    }
  }, [])

  // Re-hydrates the current user from users/{uid} after the profile is edited,
  // so the sidebar/header name stays in sync with the profile document.
  const refreshUser = useCallback(async () => {
    try {
      const u = getAuth(app).currentUser
      if (u) setUser(await hydrateProfile(u.uid, u.email))
    } catch { /* keep current user on failure */ }
  }, [hydrateProfile])

  return (
    <AuthContext.Provider value={{ user, ready, loading, login, googleLogin, signUp, resetPassword, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
