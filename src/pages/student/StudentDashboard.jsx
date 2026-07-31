import { useMemo } from 'react'
import { ClipboardText, Exam, Wallet, Briefcase } from '@phosphor-icons/react'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { StatCard, Badge, EmptyState, Panel } from '../../components/ui/primitives'
import { TodayClasses, NoticesFeed, MarksBySubject } from '../../components/dashboard/widgets'
import { ChartPanel, DonutChart, Legend, STATUS_TONES } from '../../components/charts/ChartKit'
import { pct, fmtShort } from '../../utils/format'

export default function StudentDashboard() {
  const { me } = useMe()
  const attendance = useCollection('attendance')
  const marks = useCollection('marks')
  const fees = useCollection('fees')
  const placements = useCollection('placements')

  const myAttendance = useMemo(() => {
    let p = 0, a = 0, l = 0
    attendance.data.forEach((rec) => {
      const v = rec.records?.[me?.id]
      if (v === 'present') p++
      else if (v === 'absent') a++
      else if (v === 'late') l++
    })
    return { p, a, l, total: p + a + l }
  }, [attendance.data, me])

  const avgInternal = useMemo(() => {
    const mine = marks.data.filter((m) => m.studentId === me?.id)
    if (!mine.length) return 0
    return Math.round(mine.reduce((s, m) => s + (m.marksObtained / m.maxMarks) * 100, 0) / mine.length)
  }, [marks.data, me])

  const fee = useMemo(() => fees.data.find((f) => f.studentId === me?.id), [fees.data, me])
  const upcomingDrives = placements.data.filter((p) => p.status === 'upcoming').length

  const attDonut = [
    { name: 'Present', value: myAttendance.p, color: STATUS_TONES.present },
    { name: 'Absent', value: myAttendance.a, color: STATUS_TONES.absent },
    { name: 'Late', value: myAttendance.l, color: STATUS_TONES.late },
  ]

  return (
    <div className="space-y-6">
      <div className="motion-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-3">Student</span>
          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-zinc-900 dark:text-white">Hi, {me?.name?.split(' ')[0] || 'there'}</h1>
          <p className="mt-1.5 text-[13.5px] text-zinc-500 dark:text-white/45">
            {me?.rollNo} · BCA Sem {me?.semester} · Section {me?.section}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Badge tone="indigo">Sem {me?.semester}</Badge>
          <Badge tone="mint">Active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Attendance" value={myAttendance.total ? `${pct(myAttendance.p + myAttendance.l, myAttendance.total)}%` : '—'} icon={ClipboardText} accent="mint" hint={`${myAttendance.total} sessions`} />
        <StatCard label="Internal Avg" value={`${avgInternal}%`} icon={Exam} accent="indigo" delta={avgInternal - 60} deltaTone={avgInternal >= 60 ? 'up' : 'down'} hint="across subjects" />
        <StatCard label="Fees" value={fee ? pct(fee.paid, fee.amount) + '%' : '—'} icon={Wallet} accent="amber" hint={fee?.paid === fee?.amount ? 'fully paid' : 'pending'} />
        <StatCard label="Drives" value={upcomingDrives} icon={Briefcase} accent="violet" hint="open placements" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartPanel
          title="My attendance"
          subtitle="Overall record"
          legend={<Legend items={attDonut.map((d) => ({ name: d.name, color: d.color }))} />}
        >
          <DonutChart data={attDonut} centerValue={myAttendance.total ? `${pct(myAttendance.p + myAttendance.l, myAttendance.total)}%` : '—'} centerLabel="attended" />
        </ChartPanel>
        <div className="lg:col-span-1"><TodayClasses semester={me?.semester} /></div>
        <div className="lg:col-span-1">
          <MarksBySubject studentId={me?.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Notices for you" subtitle="Department circulars & announcements">
          <NoticesFeed limit={4} />
        </Panel>

        <Panel title="Placement updates" subtitle="Active hiring pipeline">
          {placements.data.filter((p) => p.status === 'upcoming').length ? (
            <div className="space-y-3">
              {placements.data.filter((p) => p.status === 'upcoming').map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-black/5 dark:border-white/8 p-3.5">
                  <div className="h-11 w-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 shrink-0">
                    <Briefcase size={19} weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-zinc-800 dark:text-white/90">{p.company}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-white/40 mt-0.5">{p.role} · {p.package}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge tone="mint">{fmtShort(p.driveDate)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Briefcase} title="No open drives" hint="New drives will be announced here." />
          )}
        </Panel>
      </div>
    </div>
  )
}
