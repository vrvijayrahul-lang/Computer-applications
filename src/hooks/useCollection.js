import { useEffect, useState, useCallback, useRef } from 'react'
import { list, subscribeToDb } from '../services/db'

export function useCollection(collection, opts = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const optsRef = useRef(opts)

  const load = useCallback(() => {
    list(collection, optsRef.current)
      .then((res) => { setData(res); setLoading(false) })
      .catch(() => setLoading(false))
  }, [collection])

  useEffect(() => {
    optsRef.current = opts
  }, [opts])

  useEffect(() => {
    load()
    const unsub = subscribeToDb(load)
    return () => { unsub?.(); }
  }, [load])

  return { data, loading, reload: load }
}
