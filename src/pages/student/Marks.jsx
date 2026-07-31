import { useMemo } from 'react'
import { Exam } from '@phosphor-icons/react'
import { PageHeader, Panel, Badge, StatCard, EmptyState } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { pct } from '../../utils/format'

export default function StudentMarks() {
  const { me } = useMe()
  const marks = useCollection('marks')

  const mine = useMemo(() => marks.data.filter((m) => m.studentId === me?.id), [marks.data, me])

  const stats = useMemo(() => {
    const overall = mine.reduce((s, m) => s + (m.marksObtained / m.maxMarks) * 100, 0)
    const internal = mine.filter((m) => m.examType === 'Internal 1' || m.examType === 'Internal 2')
    const intAvg = internal.length ? internal.reduce((s, m) => s + (m.marksObtained / m.maxMarks) * 100, 0) / internal.length : 0
    return { avg: mine.length ? Math.round(overall / mine.length) : 0, internal: Math.round(intAvg), count: mine.length }
  }, [mine])

  const byExam = useMemo(() => {
    const map = new Map()
    mine.forEach((m) => {
      if (!map.has(m.examType)) map.set(m.examType, { sum: 0, max: 0, n: 0 })
      const e = map.get(m.examType)
      e.sum += m.marksObtained; e.max += m.maxMarks; e.n++
    })
    return [...map.entries()].map(([type, v]) => ({ type, rate: pct(v.sum, v.max), n: v.n }))
  }, [mine])

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Academics" title="Marks & results" description="Internal, practical and semester marks." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Overall" value={mine.length ? `${stats.avg}%` : '—'} icon={Exam} accent="indigo" hint="all exams" />
        <StatCard label="Internal Avg" value={`${stats.internal}%`} accent="mint" delta={stats.internal - 60} deltaTone={stats.internal >= 60 ? 'up' : 'down'} hint="best of internals" />
        <StatCard label="Exams" value={stats.count} accent="amber" hint="marks recorded" />
        <StatCard label="Semester" value={`Sem ${me?.semester}`} accent="violet" hint={me?.program} />
      </div>

      <Panel title="Marks table" subtitle="All recorded assessments">
        {mine.length ? (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/8">
                  {['Subject', 'Exam', 'Obtained', 'Max', 'Score', 'Result'].map((h) => (
                    <th key={h} className="py-2.5 pr-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/35">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mine.map((m) => {
                  const rate = pct(m.marksObtained, m.maxMarks)
                  return (
                    <tr key={m.id} className="border-b border-black/[0.04] dark:border-white/[0.04]">
                      <td className="py-3 pr-4 text-[13px] font-semibold text-zinc-800 dark:text-white/90">{m.subjectName}</td>
                      <td className="py-3 pr-4 text-[13px]"><Badge tone="slate">{m.examType}</Badge></td>
                      <td className="py-3 pr-4 text-[13px] font-bold">{m.marksObtained}</td>
                      <td className="py-3 pr-4 text-[13px] text-zinc-400">{m.maxMarks}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${rate >= 60 ? 'bg-mint-400' : 'bg-rose-glow'}`} style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-[12px] font-bold">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={rate >= 60 ? 'mint' : 'rose'}>{rate >= 60 ? 'Pass' : 'Fail'}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Exam} title="No marks yet" hint="Results will appear here once faculty enters them." />
        )}
      </Panel>

      {byExam.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
          {byExam.map((e) => (
            <div key={e.type} className="card-shell card-hover">
              <div className="card p-4 flex flex-col items-center gap-2 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/40">{e.type}</span>
                <span className={`text-[28px] font-bold ${e.rate >= 60 ? 'text-mint-500' : 'text-rose-glow'}`}>{e.rate}%</span>
                <span className="text-[11px] text-zinc-400">{e.n} assessments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
