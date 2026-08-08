import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  GraduationCap, ArrowRight, Lock, EnvelopeSimple, User, Hash, CheckCircle, ChalkboardTeacher, IdentificationCard,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/primitives'

const PROGRAMS = ['B Com']
const SEMESTERS = [1, 2, 3, 4, 5, 6]
const SECTIONS = ['A', 'B', 'C']

export default function SignUp() {
  const { signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    name: '', rollNo: '', program: 'B Com', semester: 1, section: 'A',
    empId: '', designation: '', qualification: '', specialization: '',
    email: '', password: '', confirm: '',
  })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const isFaculty = role === 'faculty'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Please enter your full name')
    if (isFaculty && !form.empId.trim()) return setError('Please enter your employee ID')
    if (!isFaculty && !form.rollNo.trim()) return setError('Please enter your roll number')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    const res = await signUp({ ...form, role })
    if (res.ok) navigate(isFaculty ? '/faculty' : '/student')
    else setError(res.error || 'Could not create account')
  }

  return (
    <div className="min-h-[100dvh] flex relative overflow-hidden">
      <div className="orb orb-indigo top-[-140px] left-[10%] h-[460px] w-[460px]" />
      <div className="orb orb-mint bottom-[-160px] right-[25%] h-[420px] w-[420px]" />
      <div className="orb orb-violet top-[30%] right-[-120px] h-[400px] w-[400px]" />

      <div className="flex-1 flex items-center justify-center px-5 py-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="card-shell">
            <div className="card p-7 sm:p-9">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-violet-600 flex items-center justify-center text-white">
                  <GraduationCap size={20} weight="bold" />
                </div>
                <div>
                  <p className="font-bold text-[16px] tracking-tight text-zinc-900 dark:text-white leading-none">PVKN Govt College (A) Chittoor</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-white/40 mt-0.5">Campus OS</p>
                </div>
              </div>

              <h2 className="text-[24px] font-bold tracking-tight text-zinc-900 dark:text-white">
                Create a {isFaculty ? 'faculty' : 'student'} account
              </h2>
              <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-white/45">
                {isFaculty
                  ? 'Register to mark attendance, enter marks and manage your subjects.'
                  : 'Register to access your timetable, attendance, marks & more.'}
              </p>

              {/* Role toggle */}
              <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-black/5 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-1.5">
                {['student', 'faculty'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all ${
                      role === r
                        ? 'text-white bg-gradient-to-r from-accent-500 to-violet-600 shadow-lg shadow-accent-500/25'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {role === r && (r === 'student' ? <GraduationCap size={14} weight="bold" /> : <ChalkboardTeacher size={14} weight="bold" />)}
                    {r === 'student' ? 'Student' : 'Faculty'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="label">Full name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input value={form.name} onChange={set('name')} placeholder={isFaculty ? 'e.g. Dr. Ananya Sharma' : 'e.g. Ananya Sharma'} className="input pl-10" />
                  </div>
                </div>

                {!isFaculty && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Roll number</label>
                      <div className="relative">
                        <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input value={form.rollNo} onChange={set('rollNo')} placeholder="e.g. 22CA101" className="input pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Semester</label>
                      <select value={form.semester} onChange={set('semester')} className="input">
                        {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {isFaculty && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Employee ID</label>
                        <div className="relative">
                          <IdentificationCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={form.empId} onChange={set('empId')} placeholder="e.g. CA010" className="input pl-10" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Designation</label>
                        <select value={form.designation} onChange={set('designation')} className="input">
                          <option value="">Select…</option>
                          <option value="Professor">Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Lecturer">Lecturer</option>
                          <option value="Lab Instructor">Lab Instructor</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Qualification</label>
                        <input value={form.qualification} onChange={set('qualification')} placeholder="e.g. M.Tech (CSE)" className="input" />
                      </div>
                      <div>
                        <label className="label">Specialization</label>
                        <input value={form.specialization} onChange={set('specialization')} placeholder="e.g. Databases" className="input" />
                      </div>
                    </div>
                  </>
                )}

                {!isFaculty && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Program</label>
                      <select value={form.program} onChange={set('program')} className="input">
                        {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Section</label>
                      <select value={form.section} onChange={set('section')} className="input">
                        {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <EnvelopeSimple size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="input pl-10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input type="password" required value={form.password} onChange={set('password')} placeholder="••••••••" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input type="password" required value={form.confirm} onChange={set('confirm')} placeholder="••••••••" className="input pl-10" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-500 dark:text-rose-glow motion-fade-up">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full !py-3 !text-[14px]" disabled={loading}>
                  {loading ? 'Creating account…' : (
                    <>
                      Create {isFaculty ? 'faculty' : 'student'} account <ArrowRight size={16} weight="bold" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-white/35">
                <CheckCircle size={13} className="text-mint-400" /> Student & faculty accounts
              </div>

              <p className="mt-5 text-center text-[12px] text-zinc-500 dark:text-white/45">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}