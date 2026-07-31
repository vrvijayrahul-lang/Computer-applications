import { useMemo, useState } from 'react'
import { PageHeader, Panel, Badge, StatCard } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { AttendanceTrend, StatusDonut } from '../../components/dashboard/widgets'
import { pct, fmtShort } from '../../utils/format'

const SEMS = [0, 1, 2, 3, 4, 5, 6]

export default function HodAttendance() {
  const { data } = useCollection('attendance', { sortBy: 'date', sortDir: 'desc' })
  const [sem, setSem] = useState(0)

  const rows = useMemo(() => {
    const all = sem ? data.filter((a) => a.semester === sem) : data
    return all.map((a) => {
      const v = Object.values(a.records || {})
      const present = v.filter((x) => x === 'present').length
      const absent = v.filter((x) => x === 'absent').length
      const late = v.filter((x) => x === 'late').length
      const total = v.length || 1
      return { ...a, present, absent, late, total, rate: pct(present + late, total) }
    })
  }, [data, sem])

  const avg = useMemo(() => (rows.length ? Math.round(rows.reduce((s, r) => s + r.rate, 0) / rows.length) : 0), [rows])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Attendance overview"
        description="Session-wise attendance health across semesters."
        actions={
          <div className="flex gap-1 rounded-full border border-black/8 dark:border-white/10 p-1">
            {SEMS.map((s) => (
              <button key={s} onClick={() => setSem(s)} className={`h-8 px-3.5 rounded-full text-[12px] font-semibold transition-all ${sem === s ? 'bg-accent-500 text-white' : 'text-zinc-500 dark:text-white/50'}`}>
                {s === 0 ? 'All' : `Sem ${s}`}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Sessions" value={rows.length} accent="indigo" hint={sem ? `sem ${sem}` : 'all semesters'} />
        <StatCard label="Avg Attendance" value={`${avg}%`} accent="mint" delta={avg - 75} deltaTone={avg >= 75 ? 'up' : 'down'} hint="rolling" />
        <StatCard label="Low < 70%" value={rows.filter((r) => r.rate < 70).length} accent="rose" hint="sessions at risk" />
        <StatCard label="High ≥ 90%" value={rows.filter((r) => r.rate >= 90).length} accent="amber" hint="sessions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><AttendanceTrend /></div>
        <StatusDonut title="Latest session" />
      </div>

      <Panel title="Session log" subtitle={`${rows.length} sessions recorded`}>
        {rows.length ? (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/8">
                  {['Date', 'Subject', 'Sem', 'Present', 'Absent', 'Late', 'Rate'].map((h) => (
                    <th key={h} className="py-2.5 pr-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/35">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 14).map((r) => (
                  <tr key={r.id} className="border-b border-black/[0.04] dark:border-white/[0.04]">
                    <td className="py-3 pr-4 text-[13px] font-medium whitespace-nowrap">{fmtShort(r.date)}</td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-700 dark:text-white/75">{r.subjectName}</td>
                    <td className="py-3 pr-4"><Badge tone="indigo">Sem {r.semester}</Badge></td>
                    <td className="py-3 pr-4 text-[13px] text-mint-400 font-semibold">{r.present}</td>
                    <td className="py-3 pr-4 text-[13px] text-rose-glow font-semibold">{r.absent}</td>
                    <td className="py-3 pr-4 text-[13px] text-amber-glow font-semibold">{r.late}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${r.rate >= 85 ? 'bg-mint-400' : r.rate >= 70 ? 'bg-amber-glow' : 'bg-rose-glow'}`} style={{ width: `${r.rate}%` }} />
                        </div>
                        <span className="text-[12px] font-bold">{r.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[13px] text-zinc-400 py-8 text-center">No sessions for this filter.</p>
        )}
      </Panel>
    </div>
  )
}
