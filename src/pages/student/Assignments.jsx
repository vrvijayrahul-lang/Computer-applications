import { useMemo, useState } from 'react'
import { PaperPlaneTilt, UploadSimple } from '@phosphor-icons/react'
import { PageHeader, Panel, Button, Badge, EmptyState } from '../../components/ui/primitives'
import Modal from '../../components/ui/Modal'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { useToast } from '../../context/ToastContext'
import { add } from '../../services/db'
import { fmtDate } from '../../utils/format'

export default function StudentAssignments() {
  const { me } = useMe()
  const { toast } = useToast()
  const assignments = useCollection('assignments', { sortBy: 'deadline', sortDir: 'asc' })
  const submissions = useCollection('assignmentSubmissions')

  const mySubs = useMemo(() => submissions.data.filter((s) => s.studentId === me?.id), [submissions.data, me])
  const subMap = useMemo(() => { const m = {}; mySubs.forEach((s) => { m[s.assignmentId] = s }); return m }, [mySubs])

  const relevant = assignments.data

  const [submitting, setSubmitting] = useState(null)
  const [form, setForm] = useState({ fileName: '', comment: '' })

  const submit = async () => {
    if (!form.fileName) return toast('Attach a file name first', 'error')
    await add('assignmentSubmissions', {
      assignmentId: submitting.id,
      studentId: me?.id,
      studentName: me?.name,
      fileName: form.fileName,
      comment: form.comment,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    })
    toast('Assignment submitted')
    setSubmitting(null)
    setForm({ fileName: '', comment: '' })
  }

  const overdue = (d) => new Date(d) < new Date()

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Academics" title="Assignments" description="Pending and completed assignments." />

      {relevant.length === 0 ? (
        <Panel><EmptyState icon={PaperPlaneTilt} title="No assignments" hint="Assignments will appear here once faculty publishes them." /></Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
          {relevant.map((a) => {
            const sub = subMap[a.id]
            const done = overdue(a.deadline)
            return (
              <div key={a.id} className="card-shell card-hover">
                <div className="card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone={sub ? 'mint' : done ? 'rose' : 'amber'}>{sub ? 'Submitted' : done ? 'Overdue' : 'Open'}</Badge>
                    <Badge tone="indigo">{a.subjectName}</Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white leading-snug">{a.title}</h3>
                    <p className="mt-1.5 text-[12.5px] text-zinc-500 dark:text-white/45 leading-relaxed line-clamp-3">{a.description}</p>
                  </div>
                  <div className="mt-auto border-t border-black/5 dark:border-white/8 pt-4 flex items-center justify-between gap-3">
                    <div className="text-[11.5px] text-zinc-400 dark:text-white/40">
                      Due {fmtDate(a.deadline)} · {a.maxMarks} marks
                      {sub && <div className="mt-0.5 text-mint-400 font-semibold">{sub.fileName}</div>}
                    </div>
                    {sub ? (
                      <Badge tone="mint">✓ {sub.status}</Badge>
                    ) : (
                      <Button size="sm" variant={done ? 'ghost' : 'primary'} disabled={done} onClick={() => { setSubmitting(a); setForm({ fileName: '', comment: '' }) }}>
                        <UploadSimple size={14} weight="bold" /> {done ? 'Closed' : 'Submit'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={submitting !== null} onClose={() => setSubmitting(null)} title="Submit assignment" subtitle={submitting?.title} size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setSubmitting(null)}>Cancel</Button>
          <Button onClick={submit}><UploadSimple size={15} weight="bold" /> Submit</Button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="label">File name</label>
            <input className="input" placeholder="e.g. assignment_final.pdf" value={form.fileName} onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.value }))} />
            <p className="mt-1 text-[11px] text-zinc-400">In this demo build, attach by naming your file. File upload to Firebase Storage is wired when a backend is configured.</p>
          </div>
          <div>
            <label className="label">Comment (optional)</label>
            <textarea rows={3} className="input" placeholder="Anything for the faculty…" value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
