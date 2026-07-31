import { useEffect, useMemo, useState } from 'react'
import { FloppyDisk } from '@phosphor-icons/react'
import { PageHeader, Button, Panel, Avatar, Badge } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { useToast } from '../../context/ToastContext'
import { add, update } from '../../services/db'

const EXAMS = ['Internal 1', 'Internal 2', 'Practical', 'Semester']

export default function MarksEntry() {
  const { me } = useMe()
  const { toast } = useToast()
  const subjects = useCollection('subjects')
  const students = useCollection('students')
  const marks = useCollection('marks')

  const mySubjects = useMemo(() => subjects.data.filter((s) => s.facultyId === me?.id), [subjects.data, me])
  const [subjectId, setSubjectId] = useState('')
  const [examType, setExamType] = useState('Internal 1')
  const [maxMarks, setMaxMarks] = useState(30)
  const [scores, setScores] = useState({})

  const subject = mySubjects.find((s) => s.id === subjectId)
  const classStudents = useMemo(
    () => (subject ? students.data.filter((s) => s.semester === subject.semester && s.status === 'active') : []),
    [subject, students.data],
  )

  const existingMarks = useMemo(
    () => marks.data.filter((m) => m.subjectId === subjectId && m.examType === examType),
    [marks.data, subjectId, examType],
  )

  useEffect(() => {
    const init = {}
    classStudents.forEach((s) => { init[s.id] = '' })
    existingMarks.forEach((m) => { init[m.studentId] = m.marksObtained })
    setScores(init)
    const first = existingMarks[0]
    if (first) setMaxMarks(first.maxMarks || maxMarks)
  }, [existingMarks, classStudents])

  const setScore = (id, v) => setScores((s) => ({ ...s, [id]: v === '' ? '' : Math.min(maxMarks, Math.max(0, Number(v))) }))

  const save = async () => {
    if (!subjectId) return toast('Select a subject first', 'error')
    const saved = []
    for (const s of classStudents) {
      const val = scores[s.id]
      if (val === '' || val == null) continue
      const payload = {
        studentId: s.id, subjectId, subjectName: subject.name, semester: subject.semester,
        examType, marksObtained: Number(val), maxMarks: Number(maxMarks),
        updatedBy: me?.id, updatedAt: new Date().toISOString(),
      }
      const existing = existingMarks.find((m) => m.studentId === s.id)
      if (existing) { await update('marks', existing.id, payload); saved.push(existing.id) }
      else { const doc = await add('marks', payload); saved.push(doc.id) }
    }
    toast(`${saved.length} marks entries saved`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teaching"
        title="Marks entry"
        description="Record internal, practical and semester marks per student."
        actions={<Button onClick={save}><FloppyDisk size={15} weight="bold" /> Save all</Button>}
      />

      <div className="card-shell motion-fade-up">
        <div className="card p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">— Select subject —</option>
                {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.name} · Sem {s.semester}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Exam</label>
              <select className="input" value={examType} onChange={(e) => setExamType(e.target.value)}>
                {EXAMS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Maximum marks</label>
              <input type="number" className="input" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} />
            </div>
          </div>
          {subject && (
            <div className="mt-4 flex gap-2.5">
              <Badge tone="indigo">{subject.name}</Badge>
              <Badge tone="mint">Sem {subject.semester}</Badge>
              <Badge tone="slate">{examType}</Badge>
            </div>
          )}
        </div>
      </div>

      {classStudents.length > 0 && (
        <Panel title={`${examType} — ${subject?.name || ''}`} subtitle={`Enter marks out of ${maxMarks}`}>
          <div className="space-y-2">
            {classStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-black/5 dark:border-white/8 px-4 py-3">
                <Avatar name={s.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 truncate">{s.name}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-white/40">{s.rollNo}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={maxMarks}
                    className="input !w-20 text-center !py-2"
                    placeholder="—"
                    value={scores[s.id] ?? ''}
                    onChange={(e) => setScore(s.id, e.target.value)}
                  />
                  <span className="text-[11px] text-zinc-400 dark:text-white/35 w-8">/{maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
