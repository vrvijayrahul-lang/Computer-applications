import { useMemo } from 'react'
import { BookOpen, GraduationCap } from '@phosphor-icons/react'
import { PageHeader, Panel, Badge, EmptyState } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'

export default function MySubjects() {
  const { me } = useMe()
  const subjects = useCollection('subjects')
  const students = useCollection('students')
  const marks = useCollection('marks')

  const mySubjects = useMemo(() => subjects.data.filter((s) => s.facultyId === me?.id), [subjects.data, me])

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Teaching" title="My subjects" description="Subjects allocated to you this semester with class composition." />

      {mySubjects.length === 0 ? (
        <Panel><EmptyState icon={BookOpen} title="No subjects assigned" hint="Your subjects will appear here after allocation." /></Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
          {mySubjects.map((s) => {
            const classStudents = students.data.filter((st) => st.semester === s.semester && st.status === 'active')
            const marked = new Set(marks.data.filter((m) => m.subjectId === s.id).map((m) => m.studentId))
            const coverage = classStudents.length ? Math.round(([...marked].filter((id) => classStudents.some((c) => c.id === id)).length / classStudents.length) * 100) : 0
            return (
              <div key={s.id} className="card-shell card-hover">
                <div className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-11 w-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500">
                      <BookOpen size={20} weight="bold" />
                    </div>
                    <div className="flex gap-2">
                      <Badge tone="indigo">Sem {s.semester}</Badge>
                      <Badge tone="slate">{s.credits} cr</Badge>
                    </div>
                  </div>
                  <h3 className="mt-4 font-bold text-[15px] text-zinc-900 dark:text-white">{s.name}</h3>
                  <p className="text-[12px] text-zinc-400 dark:text-white/40 mt-0.5">{s.code}</p>
                  <div className="mt-4 flex items-center gap-5">
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500 dark:text-white/55">
                      <GraduationCap size={15} className="text-zinc-400" />
                      {classStudents.length} students
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-zinc-400 dark:text-white/40">Marks entered</span>
                        <span className="font-bold">{coverage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${coverage >= 70 ? 'bg-mint-400' : coverage >= 40 ? 'bg-amber-glow' : 'bg-rose-glow'}`} style={{ width: `${coverage}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
