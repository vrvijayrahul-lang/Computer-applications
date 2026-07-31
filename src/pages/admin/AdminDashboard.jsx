import { useMemo } from 'react'
import { GraduationCap, ChalkboardTeacher, BookOpen, CalendarStar, Briefcase, CheckCircle } from '@phosphor-icons/react'
import { useCollection } from '../../hooks/useCollection'
import { StatCard, Badge, EmptyState, Panel } from '../../components/ui/primitives'
import { AttendanceTrend, StudentsBySemester, StatusDonut, NoticesFeed, UpcomingEvents } from '../../components/dashboard/widgets'
import { pct, fmtShort } from '../../utils/format'

export default function AdminDashboard() {
  const students = useCollection('students')
  const faculty = useCollection('faculty')
  const subjects = useCollection('subjects')
  const attendance = useCollection('attendance')
  const events = useCollection('events')
  const placements = useCollection('placements')

  const avgAttendance = useMemo(() => {
    let present = 0, total = 0
    attendance.data.forEach((a) => Object.values(a.records || {}).forEach((v) => { total++; if (v === 'present') present++ }))
    return total ? pct(present, total) : 0
  }, [attendance.data])

  const upcoming = useMemo(() => events.data.filter((e) => e.date >= new Date().toISOString()).length, [events.data])
  const recentPlacements = placements.data.filter((p) => p.status === 'upcoming').slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="motion-fade-up">
        <span className="eyebrow mb-3">Super Admin</span>
        <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-zinc-900 dark:text-white">Department overview</h1>
        <p className="mt-1.5 text-[13.5px] text-zinc-500 dark:text-white/45">A live snapshot of the Computer Applications department.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
        <StatCard label="Students" value={students.data.length} icon={GraduationCap} accent="indigo" delta={4} deltaTone="up" hint="vs last year" />
        <StatCard label="Faculty" value={faculty.data.length} icon={ChalkboardTeacher} accent="sky" delta={2} deltaTone="up" hint="this term" />
        <StatCard label="Subjects" value={subjects.data.length} icon={BookOpen} accent="amber" delta={0} hint="across 6 semesters" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} icon={CheckCircle} accent="mint" delta={3} deltaTone="up" hint="last 10 sessions" />
        <StatCard label="Upcoming Events" value={upcoming} icon={CalendarStar} accent="rose" delta={0} hint="this month" />
        <StatCard label="Placements" value={placements.data.length} icon={Briefcase} accent="violet" delta={2} deltaTone="up" hint="companies" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><AttendanceTrend /></div>
        <StatusDonut title="Last session" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1"><StudentsBySemester /></div>
        <div className="lg:col-span-2">
          <Panel title="Recent notices" subtitle="Department circulars & announcements">
            <NoticesFeed limit={4} />
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Upcoming events" subtitle="What's on the department calendar">
          <UpcomingEvents limit={3} />
        </Panel>

        <Panel title="Placement drives" subtitle="Active hiring pipeline">
          {recentPlacements.length ? (
            <div className="space-y-3">
              {recentPlacements.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-black/5 dark:border-white/8 p-3.5 hover:border-accent-500/30 transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 shrink-0">
                    <Briefcase size={19} weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-zinc-800 dark:text-white/90">{p.company}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-white/40 mt-0.5">{p.role} · {p.package}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge tone="mint">{fmtShort(p.driveDate)}</Badge>
                    <p className="text-[10px] text-zinc-400 dark:text-white/30 mt-1">Drive</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Briefcase} title="No active drives" hint="Placement drives will appear here." />
          )}
        </Panel>
      </div>
    </div>
  )
}
