import { useMemo } from 'react'
import { DownloadSimple, Printer, Database, GraduationCap, ChalkboardTeacher, ClipboardText, CalendarBlank } from '@phosphor-icons/react'
import { PageHeader, Button, StatCard, Panel, Badge } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { exportExcel, printReport } from '../../utils/export'
import { backendMode, resetDemoData } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { AttendanceTrend, StudentsBySemester } from '../../components/dashboard/widgets'
import { pct } from '../../utils/format'

export default function AdminReports() {
  const students = useCollection('students')
  const faculty = useCollection('faculty')
  const attendance = useCollection('attendance')
  const marks = useCollection('marks')
  const { toast } = useToast()

  const attendanceRate = useMemo(() => {
    let p = 0, t = 0
    attendance.data.forEach((a) => Object.values(a.records || {}).forEach((v) => { t++; if (v === 'present') p++ }))
    return t ? pct(p, t) : 0
  }, [attendance.data])

  const exportStudents = () => exportExcel(students.data.map((s) => ({
    'Roll No': s.rollNo, Name: s.name, Program: s.program, Semester: s.semester,
    Section: s.section, Email: s.email, Phone: s.phone, 'Parent': s.parentName, 'Parent Phone': s.parentPhone,
    'Admission Year': s.admissionYear, Status: s.status,
  })), 'students-report')

  const exportFaculty = () => exportExcel(faculty.data.map((f) => ({
    'Emp ID': f.empId, Name: f.name, Designation: f.designation, Qualification: f.qualification,
    Experience: f.experience, Email: f.email, Phone: f.phone, Specialization: f.specialization,
  })), 'faculty-report')

  const exportAttendance = () => {
    const rows = attendance.data.map((a) => {
      const vals = Object.values(a.records || {})
      return {
        Date: new Date(a.date).toLocaleDateString(), Subject: a.subjectName, Semester: a.semester,
        Present: vals.filter((v) => v === 'present').length,
        Absent: vals.filter((v) => v === 'absent').length,
        Late: vals.filter((v) => v === 'late').length,
      }
    })
    exportExcel(rows, 'attendance-report')
  }

  const printDepartmentReport = () => printReport(
    'Department Performance Report',
    [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'note', label: 'Note' },
    ],
    [
      { metric: 'Total students', value: students.data.length, note: 'All semesters' },
      { metric: 'Total faculty', value: faculty.data.length, note: 'Teaching staff' },
      { metric: 'Overall attendance', value: `${attendanceRate}%`, note: 'Last sessions' },
      { metric: 'Internal marks recorded', value: marks.data.length, note: 'Entries' },
    ],
  )

  const backup = () => {
    if (backendMode !== 'demo') { toast('Backup runs on the console for the Firebase backend', 'info'); return }
    const raw = localStorage.getItem('cms_db_v2')
    const blob = new Blob([raw || '{}'], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `unicore-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Backup downloaded')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Reports & Data"
        description="Department analytics, exports and data management."
        actions={
          <>
            <Button variant="ghost" onClick={backup}><Database size={15} /> Backup data</Button>
            <Button variant="danger" onClick={() => { if (confirm('Reset all demo data? This clears local records.')) { resetDemoData(); toast('Demo data reset', 'info') } }}>Reset demo</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Students" value={students.data.length} icon={GraduationCap} accent="indigo" hint="enrolled" />
        <StatCard label="Faculty" value={faculty.data.length} icon={ChalkboardTeacher} accent="sky" hint="teaching" />
        <StatCard label="Attendance" value={`${attendanceRate}%`} icon={ClipboardText} accent="mint" hint="overall" />
        <StatCard label="Marks Entries" value={marks.data.length} icon={CalendarBlank} accent="amber" hint="internal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><AttendanceTrend /></div>
        <div><StudentsBySemester /></div>
      </div>

      <Panel title="Export & print" subtitle="Generate reports in Excel or as a printable PDF">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ReportButton icon={GraduationCap} title="Student report" desc="Full student register with parents & academics" onClick={exportStudents} />
          <ReportButton icon={ChalkboardTeacher} title="Faculty report" desc="Teaching staff, qualifications & experience" onClick={exportFaculty} />
          <ReportButton icon={ClipboardText} title="Attendance report" desc="Daily attendance summary per session" onClick={exportAttendance} />
          <ReportButton icon={Printer} title="Department report" desc="Printed summary — export as PDF via print" onClick={printDepartmentReport} />
        </div>
        <div className="mt-5 flex items-center gap-2">
          <Badge tone={backendMode === 'demo' ? 'amber' : 'mint'}>{backendMode === 'demo' ? 'Demo backend' : 'Firebase'}</Badge>
          <span className="text-[11px] text-zinc-400 dark:text-white/35">
            {backendMode === 'demo' ? 'Exports read from the local demo store.' : 'Exports read live Firestore collections.'}
          </span>
        </div>
      </Panel>
    </div>
  )
}

function ReportButton({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="group text-left rounded-2xl border border-black/6 dark:border-white/10 p-4 hover:border-accent-500/40 hover:bg-accent-500/[0.03] transition-all">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500">
          <Icon size={18} weight="bold" />
        </div>
        <DownloadSimple size={16} className="text-zinc-300 dark:text-white/20 group-hover:text-accent-500 group-hover:-translate-y-0.5 transition-all" />
      </div>
      <p className="mt-3 text-[13.5px] font-bold text-zinc-800 dark:text-white/90">{title}</p>
      <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-white/40 leading-relaxed">{desc}</p>
    </button>
  )
}
