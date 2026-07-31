import { useEffect, useMemo, useState } from 'react'
import { Check, Minus, Alarm, FloppyDisk } from '@phosphor-icons/react'
import { PageHeader, Button, Panel, Avatar, Badge } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { useToast } from '../../context/ToastContext'
import { add, update } from '../../services/db'

const STATUSES = [
  { value: 'present', icon: Check, active: 'bg-mint-500 text-white border-mint-500 shadow-lg shadow-mint-500/25', label: 'Present' },
  { value: 'late', icon: Alarm, active: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25', label: 'Late' },
  { value: 'absent', icon: Minus, active: 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25', label: 'Absent' },
]

export default function MarkAttendance() {
  const { me } = useMe()
  const { toast } = useToast()
  const subjects = useCollection('subjects')
  const students = useCollection('students')
  const attendance = useCollection('attendance')

  const mySubjects = useMemo(() => subjects.data.filter((s) => s.facultyId === me?.id), [subjects.data, me])
  const [subjectId, setSubjectId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [period, setPeriod] = useState(1)
  const [records, setRecords] = useState({})

  const subject = mySubjects.find((s) => s.id === subjectId)
  const classStudents = useMemo(
    () => (subject ? students.data.filter((s) => s.semester === subject.semester && s.status === 'active') : []),
    [subject, students.data],
  )

  const existing = useMemo(
    () => attendance.data.find((a) => a.date?.slice(0, 10) === date && a.subjectId === subjectId && a.period === period),
    [attendance.data, date, subjectId, period],
  )

  useEffect(() => {
    if (existing) setRecords(existing.records || {})
    else if (classStudents.length) {
      const init = {}
      classStudents.forEach((s) => { init[s.id] = 'present' })
      setRecords(init)
    }
  }, [existing, classStudents])

  const save = async () => {
    if (!subjectId) return toast('Select a subject first', 'error')
    if (!Object.keys(records).length) return toast('No students to mark', 'error')
    const payload = {
      date: new Date(date + 'T09:00:00').toISOString(),
      subjectId, subjectName: subject.name, semester: subject.semester,
      period, takenBy: me?.id, records,
    }
    if (existing) { await update('attendance', existing.id, payload); toast('Attendance updated') }
    else { await add('attendance', payload); toast('Attendance saved') }
  }

  const setStatus = (id, status) => {
    setRecords((r) => ({ ...r, [id]: status }))
  }

  const summary = useMemo(() => {
    const v = Object.values(records)
    return {
      present: v.filter((x) => x === 'present').length,
      late: v.filter((x) => x === 'late').length,
      absent: v.filter((x) => x === 'absent').length,
    }
  }, [records])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teaching"
        title="Mark attendance"
        description="Take daily attendance for a class session."
        actions={<Button onClick={save}><FloppyDisk size={15} weight="bold" /> {existing ? 'Update' : 'Save'} attendance</Button>}
      />

      <div className="card-shell motion-fade-up">
        <div className="card p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setRecords({}) }}>
                <option value="">— Select subject —</option>
                {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.name} · Sem {s.semester}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Period</label>
              <select className="input" value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((p) => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </div>
          </div>

          {subject && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Badge tone="indigo">{subject.name}</Badge>
              <Badge tone="mint">Sem {subject.semester}</Badge>
              <Badge tone="amber">{classStudents.length} students</Badge>
              {existing && <Badge tone="rose">Already recorded — editing</Badge>}
            </div>
          )}
        </div>
      </div>

      {classStudents.length > 0 && (
        <div className="card-shell motion-fade-up">
          <div className="card p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
              {classStudents.map((s) => {
                const st = records[s.id] || 'present'
                return (
                  <div key={s.id} className="rounded-2xl border border-black/6 dark:border-white/10 p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 truncate">{s.name}</p>
                        <p className="text-[11px] text-zinc-400 dark:text-white/40">{s.rollNo}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {STATUSES.map((opt) => {
                        const Icon = opt.icon
                        const active = st === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(s.id, opt.value)}
                            className={`rounded-xl border px-2 py-2 flex flex-col items-center gap-1 text-[10.5px] font-semibold transition-all duration-300 ${active ? opt.active : 'border-black/8 dark:border-white/10 text-zinc-400 dark:text-white/35 hover:border-black/20 dark:hover:border-white/25'}`}
                          >
                            <Icon size={15} weight="bold" />
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-black/5 dark:border-white/8 pt-4">
              <span className="badge badge-mint">{summary.present} present</span>
              <span className="badge badge-amber">{summary.late} late</span>
              <span className="badge badge-rose">{summary.absent} absent</span>
              <span className="text-[11px] text-zinc-400 ml-auto">{classStudents.length} students in this class</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
