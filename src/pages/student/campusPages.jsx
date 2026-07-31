import { useMemo } from 'react'
import { Megaphone, Wallet, Rocket, Briefcase, CheckCircle, ArrowSquareOut, GithubLogo } from '@phosphor-icons/react'
import { PageHeader, Panel, Badge, EmptyState, Progress } from '../../components/ui/primitives'
import { NoticesFeed } from '../../components/dashboard/widgets'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import { pct, fmtDate, fmtShort } from '../../utils/format'

/* ------------------------------- Notices ------------------------------ */
export function StudentNotices() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Campus" title="Notices" description="Circulars, announcements and holiday notices." />
      <Panel>
        <NoticesFeed limit={10} />
      </Panel>
    </div>
  )
}

/* -------------------------------- Fees -------------------------------- */
export function StudentFees() {
  const { me } = useMe()
  const fees = useCollection('fees')
  const fee = useMemo(() => fees.data.find((f) => f.studentId === me?.id), [fees.data, me])

  if (!fee) return <Panel><EmptyState icon={Wallet} title="No fee record" hint="Your fee statement will appear here." /></Panel>

  const paidPct = pct(fee.paid, fee.amount)
  const clear = fee.paid >= fee.amount

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Campus" title="Fee status" description="Semester fee statement and payment status." />

      <div className="card-shell motion-fade-up">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow mb-4">{fee.head}</span>
              <h2 className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-white">₹{fee.amount.toLocaleString()}</h2>
              <p className="mt-1 text-[13px] text-zinc-500 dark:text-white/45">Semester {fee.semester} · {fee.rollNo}</p>
            </div>
            <div className="text-right">
              <Badge tone={clear ? 'mint' : 'amber'}>{clear ? 'Fully paid' : 'Partial payment'}</Badge>
              <p className="mt-2 text-[12px] text-zinc-400 dark:text-white/40">Due by {fmtDate(fee.dueDate)}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2 text-[12.5px]">
              <span className="text-zinc-500 dark:text-white/55">Paid <b className="text-mint-500">₹{fee.paid.toLocaleString()}</b></span>
              <span className="font-bold text-zinc-800 dark:text-white/90">{paidPct}%</span>
            </div>
            <Progress value={paidPct} tone={clear ? 'mint' : 'amber'} className="!h-2.5" />
            <div className="mt-2 flex justify-between text-[11px] text-zinc-400 dark:text-white/35">
              <span>Balance: ₹{(fee.amount - fee.paid).toLocaleString()}</span>
              {fee.paidOn && <span>Last payment: {fmtDate(fee.paidOn)}</span>}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[12px] text-zinc-400 dark:text-white/40">
            <CheckCircle size={15} className="text-mint-400" weight="bold" />
            Online payment and receipts are available through the fees module (coming soon in the portal).
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Projects ----------------------------- */
export function StudentProjects() {
  const { me } = useMe()
  const projects = useCollection('projects')

  const mine = useMemo(
    () => projects.data.filter((p) => p.students?.includes(me?.id)),
    [projects.data, me],
  )

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Campus" title="Projects" description="Your project work, guides and links." />

      {mine.length === 0 ? (
        <Panel><EmptyState icon={Rocket} title="No projects yet" hint="Your project records will appear here." /></Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
          {mine.map((p) => (
            <div key={p.id} className="card-shell card-hover">
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500">
                    <Rocket size={20} weight="bold" />
                  </div>
                  <Badge tone={p.status === 'completed' ? 'mint' : 'amber'}>{p.status}</Badge>
                </div>
                <h3 className="mt-4 font-bold text-[15px] text-zinc-900 dark:text-white leading-snug">{p.title}</h3>
                <p className="mt-1.5 text-[12.5px] text-zinc-500 dark:text-white/45">Guide: {p.guide} · {p.year}</p>
                <div className="mt-4 flex items-center gap-2.5">
                  {p.githubLink && (
                    <a href={p.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold hover:bg-black/10 dark:hover:bg-white/15 transition-colors">
                      <GithubLogo size={13} weight="bold" /> GitHub
                    </a>
                  )}
                  {p.demoLink && (
                    <a href={p.demoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 border border-accent-500/25 px-3 py-1.5 text-[11.5px] font-bold text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition-colors">
                      <ArrowSquareOut size={13} weight="bold" /> Live demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Placements ---------------------------- */
export function StudentPlacements() {
  const placements = useCollection('placements', { sortBy: 'driveDate', sortDir: 'asc' })
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Campus" title="Placement updates" description="Companies, drive schedules and eligibility." />

      {placements.data.length === 0 ? (
        <Panel><EmptyState icon={Briefcase} title="No drives yet" hint="Placement drives will be announced here." /></Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
          {placements.data.map((p) => (
            <div key={p.id} className="card-shell card-hover">
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500">
                      <Briefcase size={20} weight="bold" />
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-zinc-900 dark:text-white">{p.company}</p>
                      <p className="text-[12px] text-zinc-400 dark:text-white/40">{p.role}</p>
                    </div>
                  </div>
                  <Badge tone={p.status === 'upcoming' ? 'amber' : 'slate'}>{p.status}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Badge tone="mint">{p.package}</Badge>
                  <span className="text-[12px] text-zinc-400 dark:text-white/40">Drive on {fmtShort(p.driveDate)}</span>
                </div>
                <p className="mt-3 text-[12px] text-zinc-500 dark:text-white/50 leading-relaxed">Eligibility: {p.eligibility}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
