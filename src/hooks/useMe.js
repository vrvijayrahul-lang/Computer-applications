import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCollection } from './useCollection'

// Resolves the current user's profile document (student / faculty / hod) by role.
export function useMe() {
  const { user } = useAuth()
  const col = user?.role === 'student' ? 'students' : user?.role === 'faculty' || user?.role === 'hod' ? 'faculty' : null
  const { data, loading, reload } = useCollection(col || 'nope')
  const me = useMemo(() => (user?.profileId ? data.find((d) => d.id === user.profileId) || null : null), [data, user])
  return { me, loading, reload }
}
