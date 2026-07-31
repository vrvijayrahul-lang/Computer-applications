export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Date(iso).toLocaleDateString(undefined, opts) : '—'

export const fmtShort = (iso) => fmtDate(iso, { day: 'numeric', month: 'short' })

export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '—')

export const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0)

export const isToday = (iso) => {
  const a = new Date(iso)
  const b = new Date()
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
