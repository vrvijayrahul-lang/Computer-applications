import { Hourglass, SignOut } from '@phosphor-icons/react'
import { Button } from './primitives'

// Full-screen gate shown to faculty accounts that were self-registered but not
// yet approved by an HOD/superadmin. Rendered by AppLayout before the sidebar.
export default function PendingApproval({ onSignOut }) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-5 relative overflow-hidden">
      <div className="orb orb-amber top-[-120px] left-[10%] h-[420px] w-[420px]" />
      <div className="orb orb-indigo bottom-[-140px] right-[15%] h-[400px] w-[400px]" />
      <div className="card-shell relative z-10 w-full max-w-sm motion-fade-up">
        <div className="card p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500/80 border border-amber-500/25 flex items-center justify-center mb-5">
            <Hourglass size={26} weight="light" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white">Account pending approval</h1>
          <p className="mt-2 text-[13.5px] text-zinc-500 dark:text-white/55 leading-relaxed">
            Your faculty account has been created, but it's awaiting approval from the
            department head. You'll get access to your dashboard and subjects once it's approved.
          </p>
          <Button variant="ghost" onClick={onSignOut} className="mt-6 w-full">
            <SignOut size={15} weight="bold" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}