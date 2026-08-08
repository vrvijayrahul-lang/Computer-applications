import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, ShieldCheck, CalendarCheck, BookOpenText,
  ArrowRight, CheckCircle, Lightning, Lock, EnvelopeSimple, GoogleLogo,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../config/nav'
import { Button } from '../components/ui/primitives'
import Modal from '../components/ui/Modal'

const FEATURES = [
  { icon: ShieldCheck, text: 'Role-based portals for Admin, HOD, Faculty & Students' },
  { icon: CalendarCheck, text: 'Attendance, timetable & examination workflows' },
  { icon: BookOpenText, text: 'Assignments, study materials & performance analytics' },
]

export default function Login() {
  const { login, googleLogin, resetPassword, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotErr, setForgotErr] = useState('')
  const [sending, setSending] = useState(false)

  const doLogin = async (e) => {
    e?.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.ok) navigate(ROLE_HOME[res.role] || '/')
    else setError(res.error || 'Sign-in failed')
  }

  const doGoogle = async () => {
    setError('')
    const res = await googleLogin()
    if (res.ok) navigate(ROLE_HOME[res.role] || '/')
    else setError(res.error || 'Google sign-in failed')
  }

  const sendReset = async (e) => {
    e.preventDefault()
    setSending(true)
    setForgotMsg(''); setForgotErr('')
    const res = await resetPassword(forgotEmail)
    setSending(false)
    if (res.ok) setForgotMsg('Password reset email sent — check your inbox.')
    else setForgotErr(res.error || 'Could not send the reset email')
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
              <p className="text-[19px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">PVKN Govt College (A) Chittoor</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-white/40">Campus OS</p>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <span className="eyebrow mb-5"><Lightning size={11} weight="fill" /> Department of Computer Applications</span>
            <h1 className="text-[44px] leading-[1.06] font-bold tracking-tight text-zinc-900 dark:text-white text-balance">
              One portal for the entire department.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-zinc-500 dark:text-white/55">
              Admissions to alumni, attendance to placements — PVKN Govt College (A) Chittoor keeps every workflow of the Computer Applications department in a single, secure workspace.
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

        <p className="text-[11.5px] text-zinc-400 dark:text-white/30">© {new Date().getFullYear()} PVKN Govt College (A) Chittoor · Computer Applications</p>
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
                  <p className="font-bold text-[16px] tracking-tight text-zinc-900 dark:text-white leading-none">PVKN Govt College (A) Chittoor</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-white/40 mt-0.5">Campus OS</p>
                </div>
              </div>

              <h2 className="text-[24px] font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h2>
              <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-white/45">
                Sign in to your department workspace
              </p>

              <button
                type="button"
                onClick={doGoogle}
                disabled={loading}
                className="mt-7 w-full flex items-center justify-center gap-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-3 text-[13px] font-semibold text-zinc-700 dark:text-white/85 hover:border-accent-500/50 hover:bg-accent-500/5 transition-all disabled:opacity-50"
              >
                <GoogleLogo size={18} weight="bold" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-white/30">or sign in with email</span>
                <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
              </div>

              <form onSubmit={doLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <EnvelopeSimple size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@unicore.dev" className="input pl-10" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="label">Password</label>
                    <button type="button" onClick={() => { setForgotEmail(email); setForgotMsg(''); setForgotErr(''); setForgotOpen(true) }} className="text-[11px] font-semibold text-accent-600 dark:text-accent-400 hover:underline mb-0.5">
                      Forgot password?
                    </button>
                  </div>
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

              <p className="mt-5 text-center text-[12px] text-zinc-500 dark:text-white/45">
                New student or faculty?{' '}
                <button onClick={() => navigate('/signup')} className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">Create an account</button>
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-white/35">
                <CheckCircle size={13} className="text-mint-400" /> Connected to Firebase
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset your password" subtitle="We'll email you a secure link to set a new password." size="sm">
        <form onSubmit={sendReset} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <EnvelopeSimple size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
            </div>
          </div>
          {forgotMsg && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-600 dark:text-mint-400">
              {forgotMsg}
            </div>
          )}
          {forgotErr && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-500 dark:text-rose-glow">
              {forgotErr}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
