import { ArrowDown, ArrowUp, MagnifyingGlass, Minus, WarningCircle } from '@phosphor-icons/react'

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */
export function Button({ variant = 'primary', size, className = '', children, ...props }) {
  const v =
    variant === 'ghost' ? 'btn-ghost'
      : variant === 'danger' ? 'btn-danger'
        : variant === 'mint' ? 'btn-mint'
          : 'btn-primary'
  const s = size === 'sm' ? 'btn-sm' : ''
  return (
    <button className={`btn ${v} ${s} ${className}`} {...props}>
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */
const badgeTones = {
  mint: 'badge-mint', rose: 'badge-rose', amber: 'badge-amber', indigo: 'badge-indigo', slate: 'badge-slate',
}
export function Badge({ tone = 'slate', children, className = '' }) {
  return <span className={`badge ${badgeTones[tone] || badgeTones.slate} ${className}`}>{children}</span>
}

/* ------------------------------------------------------------------ */
/* Avatar (initials)                                                   */
/* ------------------------------------------------------------------ */
export function Avatar({ name = '', size = 40, photoUrl, className = '' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  if (photoUrl) {
    return <img src={photoUrl} alt={name} style={{ width: size, height: size }} className={`rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10 ${className}`} />
  }
  return (
    <div
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${(hue + 40) % 360} 70% 50%))`, fontSize: size * 0.36 }}
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Spinner / EmptyState                                                */
/* ------------------------------------------------------------------ */
export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <div className="h-8 w-8 rounded-full border-2 border-accent-500/20 border-t-accent-500 animate-spin" />
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon = WarningCircle, title = 'Nothing here yet', hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-accent-500/10 text-accent-500 border border-accent-500/20 mb-4">
        <Icon size={26} weight="light" />
      </div>
      <h3 className="font-semibold text-[15px] text-zinc-800 dark:text-white/90">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-[13px] text-zinc-500 dark:text-white/45">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Progress bar                                                        */
/* ------------------------------------------------------------------ */
export function Progress({ value = 0, tone = 'indigo', className = '' }) {
  const colors = {
    indigo: 'from-accent-500 to-violet-500',
    mint: 'from-mint-400 to-emerald-500',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-rose-400 to-rose-600',
  }
  return (
    <div className={`h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colors[tone] || colors.indigo}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, transition: 'width 0.8s cubic-bezier(0.32,0.72,0,1)' }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Search input                                                        */
/* ------------------------------------------------------------------ */
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlass size={15} weight="regular" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 rounded-full"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Stat card (dashboard widget)                                        */
/* ------------------------------------------------------------------ */
const accentChip = {
  indigo: 'from-accent-500/90 to-violet-500/90',
  mint: 'from-mint-400/90 to-emerald-500/90',
  amber: 'from-amber-400/90 to-orange-500/90',
  rose: 'from-rose-400/90 to-rose-600/90',
  sky: 'from-sky-400/90 to-blue-500/90',
}
export function StatCard({ label, value, icon: Icon, delta, deltaTone = 'up', hint, accent = 'indigo', children }) {
  const up = deltaTone === 'up'
  return (
    <div className="card-shell card-hover">
      <div className="card p-5 flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-white/40">{label}</p>
            <p className="mt-1.5 text-[28px] leading-none font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg shrink-0 ${accentChip[accent]}`}>
            {icon && <Icon size={20} weight="bold" />}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {delta !== undefined && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${up ? 'text-emerald-600 bg-emerald-500/10 dark:text-mint-400' : 'text-rose-600 bg-rose-500/10 dark:text-rose-glow'}`}>
              {up ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
              {delta}%
            </span>
          )}
          {hint && <span className="text-[11px] text-zinc-400 dark:text-white/40">{hint}</span>}
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 motion-fade-up">
      <div className="max-w-2xl">
        {eyebrow && <span className="eyebrow mb-3"><Minus size={10} weight="bold" />{eyebrow}</span>}
        <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">{title}</h1>
        {description && <p className="mt-1.5 text-[13.5px] text-zinc-500 dark:text-white/45">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section card wrapper (panel)                                        */
/* ------------------------------------------------------------------ */
export function Panel({ title, subtitle, actions, children, className = '', pad = true }) {
  return (
    <div className="card-shell">
      <div className={`card ${pad ? 'p-5 sm:p-6' : ''} ${className}`}>
        {(title || actions) && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              {title && <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-[12px] text-zinc-500 dark:text-white/40">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
