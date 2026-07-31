import { useMemo } from 'react'
import { BookOpen, ClipboardText, GraduationCap, PaperPlaneTilt } from '@phosphor-icons/react'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { StatCard, EmptyState } from '../../components/ui/primitives'
import { TodayClasses } from '../../components/dashboard/widgets'
import { ChartPanel, TrendChart, BarsChart, Legend } from '../../components/charts/ChartKit'
import { pct, fmtShort } from '../../utils/format'

export default function FacultyDashboard() {
  const { me } = useMe()
  const subjects = useCollection('subjects')
  const assignments = useCollection('assignments')
  const submissions = useCollection('assignmentSubmissions')
  const marks = useCollection('marks')
  const students = useCollection('students')

  const mySubjects = useMemo(() => subjects.data.filter((s) => s.facultyId === me?.id), [subjects.data, me])
  const myAssignments = useMemo(() => assignments.data.filter((a) => a.facultyId === me?.id), [assignments.data, me])

  const totalStudents = useMemo(() => {
    const sems = new Set(mySubjects.map((s) => s.semester))
    return students.data.filter((s) => sems.has(s.semester)).length
  }, [students.data, mySubjects])

  const submissionsOpen = useMemo(() => {
    const ids = new Set(myAssignments.map((a) => a.id))
    const byAssign = {}
    submissions.data.filter((s) => ids.has(s.assignmentId)).forEach((s) => { byAssign[s.assignmentId] = (byAssign[s.assignmentId] || 0) + 1 })
    let max = 0
    myAssignments.forEach((a) => { max = Math.max(max, byAssign[a.id] || 0) })
    return max
  }, [submissions.data, myAssignments])

  const avgMarks = useMemo(() => {
    const mine = marks.data.filter((m) => m.updatedBy === me?.id)
    if (!mine.length) return 0
    return Math.round(mine.reduce((s, m) => s + (m.marksObtained / m.maxMarks) * 100, 0) / mine.length)
  }, [marks.data, me])

  const perfRows = useMemo(() => {
    const buckets = [0, 0, 0, 0]
    marks.data.filter((m) => m.updatedBy === me?.id).forEach((m) => {
      const p = (m.marksObtained / m.maxMarks) * 100
      if (p < 40) buckets[0]++
      else if (p < 60) buckets[1]++
      else if (p < 80) buckets[2]++
      else buckets[3]++
    })
    return [
      { band: '<40%', count: buckets[0] },
      { band: '40–60%', count: buckets[1] },
      { band: '60–80%', count: buckets[2] },
      { band: '80%+', count: buckets[3] },
    ]
  }, [marks.data, me])

  return (
    <div className="space-y-6">
      <div className="motion-fade-up">
        <span className="eyebrow mb-3">Faculty</span>
        <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back, {me?.name?.split(' ')[0] || 'Faculty'}</h1>
        <p className="mt-1.5 text-[13.5px] text-zinc-500 dark:text-white/45">Your classes, assignments and student performance at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="My Subjects" value={mySubjects.length} icon={BookOpen} accent="indigo" hint="assigned" />
        <StatCard label="Students" value={totalStudents} icon={GraduationCap} accent="sky" hint="in my classes" />
        <StatCard label="Assignments" value={myAssignments.length} icon={PaperPlaneTilt} accent="amber" hint={`${submissionsOpen} submissions so far`} />
        <StatCard label="Avg Class Marks" value={`${avgMarks}%`} icon={ClipboardText} accent="mint" delta={avgMarks > 60 ? 2 : -1} deltaTone={avgMarks > 60 ? 'up' : 'down'} hint="internal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><TodayClasses facultyId={me?.id} /></div>
        <ChartPanel
          title="Student performance"
          subtitle="Internal marks distribution"
          legend={<Legend items={[{ name: 'Count', color: '#0284c7' }]} />}
          height={300}
        >
          <BarsChart data={perfRows} xKey="band" series={[{ key: 'count', name: 'Students', color: '#0284c7' }]} height={300} />
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartPanel title="My subjects" subtitle="Semester mapping">
          {mySubjects.length ? (
            <div className="space-y-2.5">
              {mySubjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 dark:border-white/8 px-3.5 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90">{s.name}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-white/40 mt-0.5">{s.code} · {s.credits} credits</p>
                  </div>
                  <span className="badge badge-indigo shrink-0">Sem {s.semester}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No subjects assigned" />
          )}
        </ChartPanel>

        <ChartPanel title="Open assignments" subtitle="Deadlines & submissions">
          {myAssignments.length ? (
            <div className="space-y-2.5">
              {myAssignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 dark:border-white/8 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 truncate">{a.title}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-white/40 mt-0.5">{a.subjectName} · due {fmtShort(a.deadline)}</p>
                  </div>
                  <span className="badge badge-amber shrink-0">Open</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={PaperPlaneTilt} title="No assignments yet" hint="Create one from the Assignments page." />
          )}
        </ChartPanel>
      </div>
    </div>
  )
}
