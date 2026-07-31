import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, ShieldCheck, CalendarCheck, BookOpenText,
  ArrowRight, CheckCircle, FloppyDisk, Keyboard, Lightning, Lock,
  EnvelopeSimple, Database,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME, ROLE_LABEL } from '../config/nav'
import { BACKEND_MODE } from '../config/firebase'
import { Button } from '../components/ui/primitives'
import { seedFirestore, isFirestoreSeeded } from '../services/seedFirestore'

const DEMO_ACCOUNTS = [
  { role: 'superadmin', email: 'admin@unicore.dev', password: 'admin123', hint: 'Full control' },
  { role: 'hod', email: 'hod@unicore.dev', password: 'hod123', hint: 'Department head' },
  { role: 'faculty', email: 'faculty@unicore.dev', password: 'faculty123', hint: 'Teach & assess' },
  { role: 'student', email: 'student@unicore.dev', password: 'student123', hint: 'Learn & track' },
]

const FEATURES = [
  { icon: ShieldCheck, text: 'Role-based portals for Admin, HOD, Faculty & Students' },
  { icon: CalendarCheck, text: 'Attendance, timetable & examination workflows' },
  { icon: BookOpenText, text: 'Assignments, study materials & performance analytics' },
]

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [seedError, setSeedError] = useState('')

  const doLogin = async (e, em, pw) => {
    e?.preventDefault()
    setError('')
    const res = await login(em ?? email, pw ?? password)
    if (res.ok) navigate(ROLE_HOME[res.role] || '/')
    else setError(res.error || 'Sign-in failed')
  }

  const showQuickAccounts = BACKEND_MODE === 'demo' || (BACKEND_MODE === 'firebase' && seeded)

  useEffect(() => {
    if (BACKEND_MODE !== 'firebase') return
    let mounted = true
    isFirestoreSeeded().then((ok) => mounted && setSeeded(ok)).catch(() => {})
    return () => { mounted = false }
  }, [])

  const doSeed = async () => {
    setSeeding(true)
    setSeedError('')
    try {
      await seedFirestore()
      setSeeded(true)
    } catch (e) {
      setSeedError(e?.message || 'Could not load demo data. Make sure Authentication (Email/Password) and Firestore are enabled in the Firebase console.')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex relative overflow-hidden">
      <div className="orb orb-indigo top-[-140px] left-[10%] h-[460px] w-[460px]" />
      <div className="orb orb-mint bottom-[-160px] right-[25%] h-[420px] w-[420px]" />
      <div className="orb orb-violet top-[30%] right-[-120px] h-[400px] w-[400px]" />

      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] px-14 py-12 relative z-10 border-r border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-accent-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-accent-500/30">
              <GraduationCap size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[19px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">UniCore</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-white/40">Campus OS</p>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <span className="eyebrow mb-5"><Lightning size={11} weight="fill" /> Department of Computer Applications</span>
            <h1 className="text-[44px] leading-[1.06] font-bold tracking-tight text-zinc-900 dark:text-white text-balance">
              One portal for the entire department.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-zinc-500 dark:text-white/55">
              Admissions to alumni, attendance to placements — UniCore keeps every workflow of the Computer Applications department in a single, secure workspace.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 mt-0.5 shrink-0">
                  <f.icon size={16} weight="bold" />
                </div>
                <p className="text-[13.5px] text-zinc-600 dark:text-white/70 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] text-zinc-400 dark:text-white/30">© {new Date().getFullYear()} UniCore · Computer Applications</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="card-shell">
            <div className="card p-7 sm:p-9">
              <div className="flex lg:hidden items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-violet-600 flex items-center justify-center text-white">
                  <GraduationCap size={20} weight="bold" />
                </div>
                <div>
                  <p className="font-bold text-[16px] tracking-tight text-zinc-900 dark:text-white leading-none">UniCore</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-white/40 mt-0.5">Campus OS</p>
                </div>
              </div>

              <h2 className="text-[24px] font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h2>
              <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-white/45">
                Sign in to your {BACKEND_MODE === 'firebase' ? 'department' : 'demo'} workspace
              </p>

              {showQuickAccounts && (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((a) => (
                      <button
                        key={a.role}
                        onClick={() => doLogin(null, a.email, a.password)}
                        disabled={loading}
                        className="rounded-2xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2.5 text-left hover:border-accent-500/50 hover:bg-accent-500/5 transition-all disabled:opacity-50"
                      >
                        <p className="text-[12px] font-bold text-zinc-800 dark:text-white/90">{ROLE_LABEL[a.role]}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">{a.hint}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-white/30">or sign in</span>
                    <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
                  </div>
                </>
              )}

              {BACKEND_MODE === 'firebase' && !seeded && (
                <>
                  <div className="mt-6 rounded-2xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                    <p className="text-[12.5px] font-semibold text-zinc-800 dark:text-white/90 flex items-center gap-1.5">
                      <Database size={14} className="text-accent-500" /> Your Firestore is empty
                    </p>
                    <p className="mt-1 text-[11.5px] text-zinc-500 dark:text-white/45 leading-relaxed">
                      Load the demo dataset to create the sample accounts and records in this Firebase project — then use the quick-login cards to explore each role.
                    </p>
                    <Button variant="ghost" size="sm" className="mt-3 w-full !justify-center" onClick={doSeed} disabled={seeding}>
                      {seeding ? 'Loading demo data…' : 'Load demo data'}
                    </Button>
                    {seedError && (
                      <p className="mt-2 text-[11.5px] font-medium text-rose-500 dark:text-rose-glow leading-snug">{seedError}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-white/30">or sign in</span>
                    <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
                  </div>
                </>
              )}

              <form onSubmit={(e) => doLogin(e)} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <EnvelopeSimple size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@unicore.dev" className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10" />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-500 dark:text-rose-glow motion-fade-up">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full !py-3 !text-[14px]" disabled={loading}>
                  {loading ? 'Signing in…' : (
                    <>
                      Sign in <ArrowRight size={16} weight="bold" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-white/35">
                {BACKEND_MODE === 'demo' ? (
                  <>
                    <FloppyDisk size={13} /> Demo data stored locally in your browser
                  </>
                ) : (
                  <>
                    <CheckCircle size={13} className="text-mint-400" /> Connected to Firebase
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[11.5px] text-zinc-400 dark:text-white/30 flex items-center justify-center gap-1.5">
            {showQuickAccounts ? (
              <><Keyboard size={13} /> Tip: use the quick-login cards above to explore each role</>
            ) : (
              <><Database size={13} /> New Firebase project — load demo data to get started</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
