import { useState } from 'react'
import { CalendarStar, PaperPlaneTilt } from '@phosphor-icons/react'
import { PageHeader, Button, Panel, Badge, EmptyState } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { useToast } from '../../context/ToastContext'
import { add } from '../../services/db'
import { fmtDate } from '../../utils/format'

export default function Leave() {
  const { me } = useMe()
  const { toast } = useToast()
  const leaves = useCollection('leaves')
  const [form, setForm] = useState({ type: 'Casual', from: '', to: '', reason: '' })
  const mine = leaves.data.filter((l) => l.facultyId === me?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.from || !form.reason) return toast('Dates and reason are required', 'error')
    await add('leaves', { ...form, facultyId: me?.id, facultyName: me?.name, status: 'pending', createdAt: new Date().toISOString() })
    toast('Leave request submitted')
    setForm({ type: 'Casual', from: '', to: '', reason: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Personal" title="Leave requests" description="Request leave and track approval status." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-shell motion-fade-up">
          <div className="card p-5 sm:p-6">
            <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">New request</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Leave type</label>
                <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {['Casual', 'Sick', 'Earned', 'Unpaid'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">From</label>
                  <input type="date" className="input" value={form.from} onChange={(e) => set('from', e.target.value)} />
                </div>
                <div>
                  <label className="label">To</label>
                  <input type="date" className="input" value={form.to} onChange={(e) => set('to', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Reason</label>
                <textarea rows={3} className="input" placeholder="Brief description…" value={form.reason} onChange={(e) => set('reason', e.target.value)} />
              </div>
              <Button onClick={submit} className="w-full"><PaperPlaneTilt size={15} weight="bold" /> Submit request</Button>
            </div>
          </div>
        </div>

        <Panel title="My requests" subtitle={`${mine.length} total`}>
          {mine.length ? (
            <div className="space-y-2.5">
              {mine.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 dark:border-white/8 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 shrink-0">
                      <CalendarStar size={18} weight="fill" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90">{l.type} leave</p>
                      <p className="text-[11px] text-zinc-400 dark:text-white/40">{fmtDate(l.from)} → {fmtDate(l.to)} · {l.reason}</p>
                    </div>
                  </div>
                  <Badge tone={l.status === 'approved' ? 'mint' : l.status === 'rejected' ? 'rose' : 'amber'}>{l.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarStar} title="No requests yet" hint="Your leave history will appear here." />
          )}
        </Panel>
      </div>
    </div>
  )
}
