import { useMemo, useState } from 'react'
import { Plus, PaperPlaneTilt, Users } from '@phosphor-icons/react'
import { PageHeader, Button, Panel, Badge, EmptyState, Avatar } from '../../components/ui/primitives'
import Modal from '../../components/ui/Modal'
import { FormField } from '../../components/ui/CrudPage'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { useToast } from '../../context/ToastContext'
import { add } from '../../services/db'
import { fmtDate } from '../../utils/format'

export default function Assignments() {
  const { me } = useMe()
  const { toast } = useToast()
  const assignments = useCollection('assignments')
  const submissions = useCollection('assignmentSubmissions')
  const subjects = useCollection('subjects')

  const mySubjects = useMemo(() => subjects.data.filter((s) => s.facultyId === me?.id), [subjects.data, me])
  const myAssignments = useMemo(
    () => assignments.data.filter((a) => a.facultyId === me?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [assignments.data, me],
  )

  const subCounts = useMemo(() => {
    const map = {}
    submissions.data.forEach((s) => { map[s.assignmentId] = (map[s.assignmentId] || 0) + 1 })
    return map
  }, [submissions.data])

  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [form, setForm] = useState({ title: '', subjectId: '', description: '', deadline: '', maxMarks: 10 })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const create = async () => {
    if (!form.title || !form.subjectId) return toast('Title and subject are required', 'error')
    const subj = mySubjects.find((s) => s.id === form.subjectId)
    await add('assignments', {
      ...form,
      subjectName: subj?.name || '',
      facultyId: me?.id,
      deadline: new Date(form.deadline).toISOString(),
    })
    toast('Assignment published')
    setOpen(false)
    setForm({ title: '', subjectId: '', description: '', deadline: '', maxMarks: 10 })
  }

  const viewingSubs = useMemo(
    () => (viewing ? submissions.data.filter((s) => s.assignmentId === viewing.id) : []),
    [submissions.data, viewing],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teaching"
        title="Assignments"
        description="Create assignments, track submissions and evaluate students."
        actions={<Button onClick={() => setOpen(true)}><Plus size={15} weight="bold" /> New assignment</Button>}
      />

      {myAssignments.length === 0 ? (
        <Panel><EmptyState icon={PaperPlaneTilt} title="No assignments yet" hint="Create your first assignment to get started." action={<Button onClick={() => setOpen(true)}><Plus size={15} /> New assignment</Button>} /></Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
          {myAssignments.map((a) => {
            const overdue = new Date(a.deadline) < new Date()
            const count = subCounts[a.id] || 0
            return (
              <div key={a.id} className="card-shell card-hover">
                <div className="card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone={overdue ? 'rose' : 'mint'}>{overdue ? 'Closed' : 'Open'}</Badge>
                    <Badge tone="indigo">{a.subjectName}</Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white leading-snug">{a.title}</h3>
                    <p className="mt-1.5 text-[12.5px] text-zinc-500 dark:text-white/45 leading-relaxed line-clamp-3">{a.description}</p>
                  </div>
                  <div className="mt-auto border-t border-black/5 dark:border-white/8 pt-4 flex items-center justify-between">
                    <div className="text-[11.5px] text-zinc-400 dark:text-white/40">
                      Due {fmtDate(a.deadline)} · {a.maxMarks} marks
                    </div>
                    <button onClick={() => setViewing(a)} className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 border border-accent-500/25 px-3 py-1.5 text-[11.5px] font-bold text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition-all">
                      <Users size={13} weight="bold" /> {count} submitted
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New assignment" subtitle="Publish a task for your class" size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={create}>Publish</Button>
        </>}>
        <div className="space-y-4">
          <FormField field={{ name: 'title', label: 'Title', required: true }} value={form.title} onChange={set} />
          <FormField field={{ name: 'subjectId', label: 'Subject', type: 'select', options: mySubjects.map((s) => ({ value: s.id, label: `${s.name} · Sem ${s.semester}` })), required: true }} value={form.subjectId} onChange={set} />
          <FormField field={{ name: 'description', label: 'Description', type: 'textarea', fullWidth: true }} value={form.description} onChange={set} />
          <div className="grid grid-cols-2 gap-4">
            <FormField field={{ name: 'deadline', label: 'Deadline', type: 'datetime-local' }} value={form.deadline} onChange={set} />
            <FormField field={{ name: 'maxMarks', label: 'Max marks', type: 'number' }} value={form.maxMarks} onChange={set} />
          </div>
        </div>
      </Modal>

      {/* Submissions modal */}
      <Modal open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.title} subtitle="Student submissions" size="md">
        {viewingSubs.length ? (
          <div className="space-y-2.5">
            {viewingSubs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-black/5 dark:border-white/8 p-3.5">
                <Avatar name={s.studentName || s.studentId} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 truncate">{s.studentName || s.studentId}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-white/40">{s.fileName || 'Attachment'} · {new Date(s.submittedAt).toLocaleString()}</p>
                </div>
                <Badge tone={s.status === 'submitted' ? 'mint' : 'slate'}>{s.status}</Badge>
                {s.marks != null && <Badge tone="indigo">{s.marks}/{viewing?.maxMarks}</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No submissions yet" hint="Students' work will appear here once submitted." />
        )}
      </Modal>
    </div>
  )
}
