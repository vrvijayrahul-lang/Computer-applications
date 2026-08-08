import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Moon, Sun, Bell, List, X, SignOut, GraduationCap, CaretDown } from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { NAV, ROLE_LABEL, ROLE_HOME } from '../../config/nav'
import { useCollection } from '../../hooks/useCollection'
import { Avatar } from '../ui/primitives'
import PendingApproval from '../ui/PendingApproval'

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { data: notices } = useCollection('notices', { sortBy: 'date', sortDir: 'desc' })

  // A self-registered faculty account that hasn't been approved yet sees the
  // pending screen instead of any role dashboard.
  if (user?.profileStatus === 'pending') return <PendingApproval onSignOut={logout} />

  const nav = NAV[user?.role] || []
  const home = ROLE_HOME[user?.role] || '/'
  const notifs = notices.slice(0, 5)

  const SidebarInner = (
    <>
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-accent-500/30 shrink-0">
          <GraduationCap size={20} weight="bold" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[16px] tracking-tight text-zinc-900 dark:text-white leading-none">PVKN Govt College (A) Chittoor</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-white/40 truncate">Computer Applications</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        {nav.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-white/30">{group.section}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === home}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-accent-500 to-violet-600 shadow-lg shadow-accent-500/25'
                        : 'text-zinc-600 dark:text-white/55 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon size={17} weight="regular" className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <div className="card-shell !rounded-2xl">
          <div className="card !rounded-[calc(2rem-6px)] p-3">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} size={38} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10.5px] text-zinc-400 dark:text-white/40">{ROLE_LABEL[user?.role]}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                <SignOut size={15} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-[100dvh] relative">
      {/* ambient orbs */}
      <div className="orb orb-indigo top-[-120px] left-[20%] h-[420px] w-[420px] dark:h-[340px] dark:w-[340px]" />
      <div className="orb orb-violet bottom-[-140px] right-[5%] h-[400px] w-[400px] dark:h-[320px] dark:w-[320px]" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] z-30 flex-col bg-white/80 dark:bg-ink-900/85 glass border-r border-black/5 dark:border-white/5">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-[280px] bg-white dark:bg-ink-900 flex flex-col animate-modal-in border-r border-black/5 dark:border-white/10">
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-4 h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
              <X size={16} />
            </button>
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 glass border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-ink-950/70">
          <div className="flex items-center gap-3 px-4 sm:px-7 h-16">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-zinc-600 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10">
              <List size={18} weight="bold" />
            </button>

            <div className="flex-1" />

            <button
              onClick={toggle}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-500 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Toggle theme"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative h-9 w-9 rounded-xl flex items-center justify-center text-zinc-500 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Bell size={17} weight="regular" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-950" />
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[320px] z-20 animate-modal-in">
                    <div className="card-shell !bg-white dark:!bg-ink-900">
                      <div className="card !rounded-[calc(1.75rem-6px)] p-4 max-h-[60dvh] overflow-y-auto">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-white/40 mb-3">Latest notices</p>
                        {notifs.length === 0 && <p className="text-[12px] text-zinc-400">No recent notices.</p>}
                        <div className="space-y-2">
                          {notifs.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => { setNotifOpen(false); navigate(user?.role === 'student' ? '/student/notices' : user?.role === 'faculty' ? '/faculty' : user?.role === 'hod' ? '/hod/notices' : '/admin/notices') }}
                              className="w-full text-left rounded-xl p-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors border border-transparent"
                            >
                              <p className="text-[12.5px] font-semibold text-zinc-800 dark:text-white/90 leading-snug">{n.title}</p>
                              <p className="mt-1 text-[10.5px] text-zinc-400 dark:text-white/35">
                                {new Date(n.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {n.category}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 pl-1">
              <Avatar name={user?.name} size={34} />
            </button>
          </div>
        </header>

        <main className="relative px-4 sm:px-7 py-7 sm:py-9 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  )
}
