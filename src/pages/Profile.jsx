import { EnvelopeSimple, Phone, IdentificationCard, CalendarBlank } from '@phosphor-icons/react'
import { PageHeader, Panel, Badge, Avatar } from '../components/ui/primitives'
import { useAuth } from '../context/AuthContext'
import { useMe } from '../hooks/useMe'
import { ROLE_LABEL } from '../config/nav'
import { fmtDate } from '../utils/format'

export default function Profile() {
  const { user } = useAuth()
  const { me } = useMe()
  if (!user) return null

  const isStudent = user.role === 'student'
  const name = me?.name || user.name || user.email?.split('@')[0] || 'Account'
  const email = me?.email || user.email

  // Accounts without a linked student/faculty record (e.g. superadmin, or a
  // user whose profile doc isn't set up yet) still get a usable profile view.
  const subLine = isStudent
    ? `${me?.rollNo || '—'} · ${me?.program || '—'} Sem ${me?.semester || '—'} · Section ${me?.section || '—'}`
    : me
      ? `${me.designation} · ${me.qualification}`
      : 'No detailed profile is linked to this account yet.'

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="My profile" description="Your details and role information." />

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
