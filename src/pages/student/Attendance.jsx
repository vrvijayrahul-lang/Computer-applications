import { useMemo } from 'react'
import { ClipboardText } from '@phosphor-icons/react'
import { PageHeader, Panel, Badge, StatCard, EmptyState } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { pct, fmtShort } from '../../utils/format'

export default function StudentAttendance() {
  const { me } = useMe()
  const attendance = useCollection('attendance', { sortBy: 'date', sortDir: 'desc' })

  const rows = useMemo(
    () => attendance.data
      .filter((a) => a.records?.[me?.id])
      .map((a) => ({ ...a, status: a.records[me.id] })),
    [attendance.data, me],
  )

  const stats = useMemo(() => {
    const p = rows.filter((r) => r.status === 'present').length
    const l = rows.filter((r) => r.status === 'late').length
    const ab = rows.filter((r) => r.status === 'absent').length
    return { p, l, ab, total: rows.length, attended: pct(p + l, rows.length) }
  }, [rows])

  const perSubject = useMemo(() => {
    const map = new Map()
    rows.forEach((r) => {
      if (!map.has(r.subjectName)) map.set(r.subjectName, { p: 0, t: 0 })
      const s = map.get(r.subjectName)
      s.t++
      if (r.status === 'present' || r.status === 'late') s.p++
    })
    return [...map.entries()].map(([name, v]) => ({ name, rate: pct(v.p, v.t) }))
  }, [rows])

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Academics" title="My attendance" description="Your attendance record across all sessions." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Attendance" value={stats.total ? `${stats.attended}%` : '—'} icon={ClipboardText} accent="mint" delta={stats.attended - 75} deltaTone={stats.attended >= 75 ? 'up' : 'down'} hint="required ≥ 75%" />
        <StatCard label="Present" value={stats.p} accent="indigo" hint="sessions" />
        <StatCard label="Late" value={stats.l} accent="amber" hint="marked late" />
        <StatCard label="Absent" value={stats.ab} accent="rose" hint="sessions missed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="Session log" subtitle="Latest sessions first">
            {rows.length ? (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left min-w-[560px]">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/8">
                      {['Date', 'Subject', 'Period', 'Status'].map((h) => (
                        <th key={h} className="py-2.5 pr-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/35">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r) => (
                      <tr key={r.id} className="border-b border-black/[0.04] dark:border-white/[0.04]">
                        <td className="py-3 pr-4 text-[13px] font-medium whitespace-nowrap">{fmtShort(r.date)}</td>
                        <td className="py-3 pr-4 text-[13px] text-zinc-700 dark:text-white/75">{r.subjectName}</td>
                        <td className="py-3 pr-4 text-[13px]">Period {r.period}</td>
                        <td className="py-3 pr-4">
                          <Badge tone={r.status === 'present' ? 'mint' : r.status === 'late' ? 'amber' : 'rose'}>{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={ClipboardText} title="No attendance yet" hint="Attendance will appear after your classes are marked." />
            )}
          </Panel>
        </div>

        <Panel title="Per subject" subtitle="Attendance rate by subject">
          {perSubject.length ? (
            <div className="space-y-3">
              {perSubject.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-zinc-600 dark:text-white/70 truncate pr-2">{s.name}</span>
                    <span className={`font-bold ${s.rate >= 75 ? 'text-mint-500' : 'text-rose-glow'}`}>{s.rate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${s.rate >= 75 ? 'bg-mint-400' : 'bg-rose-glow'}`} style={{ width: `${s.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ClipboardText} title="No data yet" />
          )}
        </Panel>
      </div>
    </div>
  )
}
