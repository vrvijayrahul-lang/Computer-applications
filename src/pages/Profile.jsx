import { useState } from 'react'
import { EnvelopeSimple, Phone, IdentificationCard, CalendarBlank, NotePencil } from '@phosphor-icons/react'
import { PageHeader, Panel, Badge, Avatar, Button } from '../components/ui/primitives'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { useMe } from '../hooks/useMe'
import { useToast } from '../context/ToastContext'
import { update } from '../services/db'
import { ROLE_LABEL } from '../config/nav'
import { fmtDate } from '../utils/format'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { me, reload } = useMe()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  if (!user) return null

  const isStudent = user.role === 'student'
  const isStaff = user.role === 'faculty' || user.role === 'hod'
  const col = isStudent ? 'students' : isStaff ? 'faculty' : null
  const name = me?.name || user.name || user.email?.split('@')[0] || 'Account'
  const email = me?.email || user.email

  // Accounts without a linked student/faculty record (e.g. superadmin, or a
  // user whose profile doc isn't set up yet) still get a usable profile view.
  const subLine = isStudent
    ? `${me?.rollNo || '—'} · ${me?.program || '—'} Sem ${me?.semester || '—'} · Section ${me?.section || '—'}`
    : me
      ? `${me.designation} · ${me.qualification}`
      : 'No detailed profile is linked to this account yet.'

  const openEdit = () => {
    setForm({
      name: me?.name || '',
      phone: me?.phone || '',
      gender: me?.gender || '',
      dob: me?.dob ? new Date(me.dob).toISOString().slice(0, 10) : '',
      address: me?.address || '',
      parentName: me?.parentName || '',
      parentPhone: me?.parentPhone || '',
      designation: me?.designation || '',
      qualification: me?.qualification || '',
      specialization: me?.specialization || '',
    })
    setEditing(true)
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async () => {
    if (!col || !me) return
    if (!form.name.trim()) return toast('Name cannot be empty', 'error')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender.trim(),
      dob: form.dob ? new Date(form.dob).toISOString() : '',
      address: form.address.trim(),
    }
    if (isStudent) {
      payload.parentName = form.parentName.trim()
      payload.parentPhone = form.parentPhone.trim()
    } else {
      payload.designation = form.designation.trim()
      payload.qualification = form.qualification.trim()
      payload.specialization = form.specialization.trim()
    }
    try {
      await update(col, me.id, payload)
      // Keep the sidebar/header name in sync. If rules block this write, the
      // name still updates on next sign-in — not worth failing the save over.
      try { await update('users', user.uid, { name: payload.name }) } catch { /* noop */ }
      toast('Profile updated')
      setEditing(false)
      reload()
      refreshUser()
    } catch (e) {
      toast(e.message || 'Could not save your profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Your details and role information."
        actions={
          me && col ? (
            <Button variant="ghost" onClick={openEdit}>
              <NotePencil size={15} weight="bold" /> Edit profile
            </Button>
          ) : undefined
        }
      />

      <div className="card-shell motion-fade-up">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar name={name} size={84} photoUrl={me?.photoUrl} className="!text-[26px]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[24px] font-bold tracking-tight text-zinc-900 dark:text-white">{name}</h2>
                <Badge tone="indigo">{ROLE_LABEL[user.role]}</Badge>
              </div>
              <p className="mt-1 text-[13px] text-zinc-500 dark:text-white/45">{subLine}</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Badge tone="mint"><EnvelopeSimple size={12} /> {email}</Badge>
                {me?.phone && <Badge tone="slate"><Phone size={12} /> {me.phone}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Academic details">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Admission year" value={isStudent ? me?.admissionYear : me ? `${me.experience} years exp` : '—'} icon={CalendarBlank} />
            <Detail label="Roll / Emp ID" value={isStudent ? me?.rollNo : me?.empId} icon={IdentificationCard} />
            <Detail label="Gender" value={me?.gender || '—'} />
            <Detail label="Date of birth" value={me?.dob ? fmtDate(me.dob) : '—'} />
            {isStudent && <Detail label="Parent / guardian" value={me?.parentName || '—'} />}
            {isStudent && <Detail label="Parent phone" value={me?.parentPhone || '—'} />}
            {!isStudent && <Detail label="Specialization" value={me?.specialization || '—'} />}
          </div>
        </Panel>

        <Panel title="Contact & address">
          <div className="space-y-4">
            <Detail label="Email" value={email} />
            <Detail label="Phone" value={me?.phone || '—'} />
            <Detail label="Address" value={me?.address || '—'} />
            <Detail label="Status" value={me?.status || 'active'} />
          </div>
        </Panel>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
        subtitle="Update your personal details. Your email address is your login and can't be changed here."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => { e.preventDefault(); save() }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Field label="Full name">
            <input className="input" value={form.name || ''} onChange={set('name')} placeholder="Your name" />
          </Field>
          <Field label="Email">
            <input className="input" value={email || ''} disabled />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone || ''} onChange={set('phone')} placeholder="Phone number" />
          </Field>
          <Field label="Gender">
            <select className="input" value={form.gender || ''} onChange={set('gender')}>
              <option value="">Not specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Date of birth">
            <input type="date" className="input" value={form.dob || ''} onChange={set('dob')} />
          </Field>
          <Field label="Address">
            <input className="input" value={form.address || ''} onChange={set('address')} placeholder="Home address" />
          </Field>

          {isStudent && (
            <>
              <Field label="Parent / guardian">
                <input className="input" value={form.parentName || ''} onChange={set('parentName')} placeholder="Parent or guardian name" />
              </Field>
              <Field label="Parent phone">
                <input className="input" value={form.parentPhone || ''} onChange={set('parentPhone')} placeholder="Parent phone number" />
              </Field>
            </>
          )}

          {isStaff && (
            <>
              <Field label="Designation">
                <input className="input" value={form.designation || ''} onChange={set('designation')} placeholder="e.g. Assistant Professor" />
              </Field>
              <Field label="Qualification">
                <input className="input" value={form.qualification || ''} onChange={set('qualification')} placeholder="e.g. M.Tech (CSE)" />
              </Field>
              <Field label="Specialization">
                <input className="input" value={form.specialization || ''} onChange={set('specialization')} placeholder="e.g. Databases" />
              </Field>
            </>
          )}
        </form>
      </Modal>
    </div>
  )
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/8 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-white/35 flex items-center gap-1.5">
        {Icon && <Icon size={12} />} {label}
      </p>
      <p className="mt-1.5 text-[13.5px] font-medium text-zinc-800 dark:text-white/85 break-words">{value || '—'}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
