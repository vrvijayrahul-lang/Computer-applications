import CrudPage from '../../components/ui/CrudPage'
import { Avatar, Badge } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { fmtDate } from '../../utils/format'

const SEM_OPTIONS = [1, 2, 3, 4, 5, 6]

/* ------------------------------- Students ------------------------------ */
export function StudentsPage() {
  const students = useCollection('students')
  return (
    <CrudPage
      collection="students"
      eyebrow="Academics"
      title="Students"
      description="Admission records, parent details and academic status for the department."
      exportName="students"
      searchKeys={['name', 'rollNo', 'email', 'phone']}
      statCards={[
        { label: 'Total', value: students.data.length, accent: 'indigo', hint: 'students' },
        { label: 'Active', value: students.data.filter((s) => s.status === 'active').length, accent: 'mint', hint: 'enrolled' },
        { label: 'Final Year', value: students.data.filter((s) => s.semester === 6).length, accent: 'amber', hint: 'Sem 6' },
        { label: 'Placed', value: students.data.filter((s) => s.placed).length, accent: 'violet', hint: 'this batch' },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Student',
          render: (s) => (
            <div className="flex items-center gap-3">
              <Avatar name={s.name} size={34} photoUrl={s.photoUrl} />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white/90">{s.name}</p>
                <p className="text-[11px] text-zinc-400 dark:text-white/40">{s.rollNo}</p>
              </div>
            </div>
          ),
        },
        { key: 'semester', label: 'Sem', render: (s) => <Badge tone="indigo">Sem {s.semester}</Badge>, className: 'whitespace-nowrap' },
        { key: 'section', label: 'Sec', render: (s) => s.section },
        { key: 'email', label: 'Email', render: (s) => <span className="text-zinc-500 dark:text-white/55">{s.email}</span> },
        { key: 'phone', label: 'Phone', render: (s) => s.phone, className: 'whitespace-nowrap' },
        { key: 'status', label: 'Status', render: (s) => <Badge tone={s.status === 'active' ? 'mint' : 'slate'}>{s.status}</Badge> },
      ]}
      formFields={[
        { name: 'name', label: 'Full name', required: true },
        { name: 'rollNo', label: 'Roll number', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone' },
        { name: 'program', label: 'Program', type: 'select', options: ['B Com'], fullWidth: true },
        { name: 'semester', label: 'Semester', type: 'select', options: SEM_OPTIONS },
        { name: 'section', label: 'Section', type: 'select', options: ['A', 'B'] },
        { name: 'admissionYear', label: 'Admission year', type: 'number' },
        { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { name: 'dob', label: 'Date of birth', type: 'date' },
        { name: 'parentName', label: 'Parent / guardian', fullWidth: true },
        { name: 'parentPhone', label: 'Parent phone' },
        { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
        { name: 'photoUrl', label: 'Photo URL', hint: 'Paste an image link for the profile photo' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ]}
    />
  )
}

/* ------------------------------- Faculty ------------------------------- */
export function FacultyPage() {
  const faculty = useCollection('faculty')
  return (
    <CrudPage
      collection="faculty"
      eyebrow="Academics"
      title="Faculty"
      description="Teaching staff, qualifications and experience records."
      exportName="faculty"
      searchKeys={['name', 'empId', 'email', 'designation']}
      statCards={[
        { label: 'Total', value: faculty.data.length, accent: 'indigo', hint: 'faculty' },
        { label: 'Professors', value: faculty.data.filter((f) => f.designation?.toLowerCase().includes('prof')).length, accent: 'violet', hint: 'senior' },
        { label: 'Avg Experience', value: faculty.data.length ? Math.round(faculty.data.reduce((s, f) => s + (f.experience || 0), 0) / faculty.data.length) : 0, accent: 'amber', hint: 'years' },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Faculty',
          render: (f) => (
            <div className="flex items-center gap-3">
              <Avatar name={f.name} size={34} />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white/90">{f.name}</p>
                <p className="text-[11px] text-zinc-400 dark:text-white/40">{f.empId}</p>
              </div>
            </div>
          ),
        },
        { key: 'designation', label: 'Designation', render: (f) => <Badge tone="indigo">{f.designation}</Badge>, className: 'whitespace-nowrap' },
        { key: 'qualification', label: 'Qualification', render: (f) => <span className="text-zinc-500 dark:text-white/55">{f.qualification}</span> },
        { key: 'experience', label: 'Experience', render: (f) => <span>{f.experience} yrs</span>, className: 'whitespace-nowrap' },
        { key: 'email', label: 'Email', render: (f) => <span className="text-zinc-500 dark:text-white/55">{f.email}</span> },
        { key: 'specialization', label: 'Specialization' },
      ]}
      formFields={[
        { name: 'name', label: 'Full name', required: true },
        { name: 'empId', label: 'Employee ID', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone' },
        { name: 'designation', label: 'Designation', type: 'select', options: ['Professor & Head', 'Professor', 'Associate Professor', 'Assistant Professor'], fullWidth: true },
        { name: 'qualification', label: 'Qualification' },
        { name: 'experience', label: 'Experience (years)', type: 'number' },
        { name: 'specialization', label: 'Specialization', fullWidth: true },
      ]}
    />
  )
}

/* ------------------------------ Departments ---------------------------- */
export function DepartmentsPage() {
  return (
    <CrudPage
      collection="departments"
      eyebrow="Academics"
      title="Departments"
      description="Departments managed under PVKN Govt College (A) Chittoor."
      exportName="departments"
      searchKeys={['name', 'code', 'program']}
      columns={[
        { key: 'name', label: 'Department', render: (d) => <span className="font-semibold text-zinc-800 dark:text-white/90">{d.name}</span> },
        { key: 'code', label: 'Code', render: (d) => <Badge tone="indigo">{d.code}</Badge> },
        { key: 'program', label: 'Program' },
        { key: 'semesters', label: 'Semesters', render: (d) => <span>{d.semesters} semesters</span> },
      ]}
      formFields={[
        { name: 'name', label: 'Department name', required: true },
        { name: 'code', label: 'Code', required: true },
        { name: 'program', label: 'Program', type: 'select', options: ['B Com'] },
        { name: 'semesters', label: 'Semesters', type: 'number' },
      ]}
    />
  )
}

/* ------------------------------- Subjects ------------------------------ */
export function SubjectsPage() {
  const faculty = useCollection('faculty')
  const options = faculty.data.map((f) => ({ value: f.id, label: f.name }))
  return (
    <CrudPage
      collection="subjects"
      eyebrow="Academics"
      title="Subjects"
      description="Curriculum mapping — subjects, credits, semesters and faculty allocation."
      exportName="subjects"
      searchKeys={['name', 'code', 'facultyName']}
      columns={[
        { key: 'code', label: 'Code', render: (s) => <Badge tone="slate">{s.code}</Badge>, className: 'whitespace-nowrap' },
        { key: 'name', label: 'Subject', render: (s) => <span className="font-semibold text-zinc-800 dark:text-white/90">{s.name}</span> },
        { key: 'semester', label: 'Semester', render: (s) => <Badge tone="indigo">Sem {s.semester}</Badge> },
        { key: 'credits', label: 'Credits', render: (s) => s.credits },
        { key: 'facultyName', label: 'Faculty', render: (s) => <span className="text-zinc-500 dark:text-white/55">{s.facultyName || 'Unassigned'}</span> },
      ]}
      formFields={[
        { name: 'name', label: 'Subject name', required: true },
        { name: 'code', label: 'Subject code', required: true },
        { name: 'semester', label: 'Semester', type: 'select', options: SEM_OPTIONS },
        { name: 'credits', label: 'Credits', type: 'number' },
        { name: 'facultyId', label: 'Faculty', type: 'select', options, fullWidth: true },
      ]}
      onBeforeSave={(v) => ({ ...v, facultyName: faculty.data.find((f) => f.id === v.facultyId)?.name || '' })}
    />
  )
}

/* -------------------------------- Notices ------------------------------ */
export function NoticesPage() {
  return (
    <CrudPage
      collection="notices"
      eyebrow="Operations"
      title="Notices & Circulars"
      description="Announcements, circulars, exam schedules and holiday notices."
      exportName="notices"
      searchKeys={['title', 'category', 'body']}
      columns={[
        { key: 'title', label: 'Notice', render: (n) => <span className="font-semibold text-zinc-800 dark:text-white/90">{n.title}</span> },
        { key: 'category', label: 'Category', render: (n) => <Badge tone={n.category === 'Examination' ? 'rose' : n.category === 'Holiday' ? 'amber' : n.category === 'Placement' ? 'mint' : 'slate'}>{n.category}</Badge> },
        { key: 'audience', label: 'Audience', render: (n) => <Badge tone="indigo">{n.audience}</Badge> },
        { key: 'date', label: 'Date', render: (n) => fmtDate(n.date), className: 'whitespace-nowrap' },
        { key: 'pinned', label: 'Pinned', render: (n) => (n.pinned ? <Badge tone="amber">★ Pinned</Badge> : <span className="text-zinc-400">—</span>) },
      ]}
      formFields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Examination', 'Circular', 'Announcement', 'Holiday', 'Placement', 'Seminar'], fullWidth: true },
        { name: 'audience', label: 'Audience', type: 'select', options: [{ value: 'all', label: 'Everyone' }, { value: 'student', label: 'Students' }, { value: 'final', label: 'Final year only' }, { value: 'faculty', label: 'Faculty' }] },
        { name: 'date', label: 'Publish date & time', type: 'datetime-local' },
        { name: 'body', label: 'Message', type: 'textarea', fullWidth: true, required: true },
        { name: 'pinned', label: 'Pin this notice', type: 'toggle' },
      ]}
    />
  )
}

/* --------------------------------- Events ------------------------------ */
export function EventsPage() {
  return (
    <CrudPage
      collection="events"
      eyebrow="Operations"
      title="Events"
      description="Seminars, workshops, hackathons and guest lectures."
      exportName="events"
      searchKeys={['title', 'category', 'venue']}
      columns={[
        { key: 'title', label: 'Event', render: (e) => <span className="font-semibold text-zinc-800 dark:text-white/90">{e.title}</span> },
        { key: 'category', label: 'Category', render: (e) => <Badge tone="indigo">{e.category}</Badge> },
        { key: 'date', label: 'Date & time', render: (e) => fmtDate(e.date), className: 'whitespace-nowrap' },
        { key: 'venue', label: 'Venue' },
      ]}
      formFields={[
        { name: 'title', label: 'Event title', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Seminar', 'Workshop', 'Hackathon', 'Guest Lecture', 'Tech Fest'], fullWidth: true },
        { name: 'date', label: 'Date & time', type: 'datetime-local' },
        { name: 'venue', label: 'Venue' },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
      ]}
    />
  )
}

/* ------------------------------- Placements ---------------------------- */
export function PlacementsPage() {
  return (
    <CrudPage
      collection="placements"
      eyebrow="Operations"
      title="Placements"
      description="Companies, drive schedules, eligibility and selected students."
      exportName="placements"
      searchKeys={['company', 'role', 'eligibility']}
      columns={[
        { key: 'company', label: 'Company', render: (p) => <span className="font-semibold text-zinc-800 dark:text-white/90">{p.company}</span> },
        { key: 'role', label: 'Role' },
        { key: 'package', label: 'Package', render: (p) => <Badge tone="mint">{p.package}</Badge> },
        { key: 'driveDate', label: 'Drive date', render: (p) => fmtDate(p.driveDate), className: 'whitespace-nowrap' },
        { key: 'selectedCount', label: 'Selected', render: (p) => <span>{p.selectedCount || 0} students</span> },
        { key: 'status', label: 'Status', render: (p) => <Badge tone={p.status === 'completed' ? 'slate' : 'amber'}>{p.status}</Badge> },
      ]}
      formFields={[
        { name: 'company', label: 'Company', required: true },
        { name: 'role', label: 'Role', required: true },
        { name: 'package', label: 'Package (e.g. 4.5 LPA)' },
        { name: 'driveDate', label: 'Drive date', type: 'date' },
        { name: 'eligibility', label: 'Eligibility criteria', fullWidth: true },
        { name: 'selectedCount', label: 'Selected count', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'completed'] },
      ]}
    />
  )
}
