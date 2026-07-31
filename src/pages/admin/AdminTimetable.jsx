import { useMemo, useState } from 'react'
import CrudPage from '../../components/ui/CrudPage'
import { PageHeader, Panel } from '../../components/ui/primitives'
import TimetableGrid from '../../components/TimetableGrid'
import { useCollection } from '../../hooks/useCollection'

const SEMS = [1, 2, 3, 4, 5, 6]

export default function AdminTimetable() {
  const [sem, setSem] = useState(1)
  const { data } = useCollection('timetable')
  const semesterRows = useMemo(() => data.filter((t) => t.semester === sem), [data, sem])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academics"
        title="Timetable"
        description="Weekly class schedule per semester — publish and manage sessions."
        actions={
          <div className="flex gap-1 rounded-full border border-black/8 dark:border-white/10 p-1 bg-black/[0.02] dark:bg-white/[0.03]">
            {SEMS.map((s) => (
              <button
                key={s}
                onClick={() => setSem(s)}
                className={`h-8 px-3.5 rounded-full text-[12px] font-semibold transition-all duration-300 ${sem === s ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25' : 'text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Sem {s}
              </button>
            ))}
          </div>
        }
      />

      <div className="motion-fade-up">
        <Panel title={`Semester ${sem} — weekly schedule`} subtitle="Hover or click sessions to manage">
          <TimetableGrid data={semesterRows} showFaculty />
        </Panel>
      </div>

      <CrudPage
        collection="timetable"
        hideHeader
        filter={(t) => t.semester === sem}
        emptyHint="Add sessions for this semester below."
        exportName={`timetable-sem-${sem}`}
        columns={[
          { key: 'day', label: 'Day', render: (t) => <span className="font-semibold">{t.day}</span> },
          { key: 'period', label: 'Period', render: (t) => <span className="badge badge-indigo">P{t.period}</span> },
          { key: 'time', label: 'Time' },
          { key: 'subjectName', label: 'Subject', render: (t) => t.subjectName },
          { key: 'facultyName', label: 'Faculty' },
          { key: 'classroom', label: 'Room' },
        ]}
        formFields={[
          { name: 'day', label: 'Day', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
          { name: 'semester', label: 'Semester', type: 'select', options: SEMS },
          { name: 'period', label: 'Period', type: 'select', options: [1, 2, 3, 4, 5, 6] },
          { name: 'time', label: 'Time slot (e.g. 09:00 – 09:50)', fullWidth: true },
          { name: 'subjectName', label: 'Subject', required: true },
          { name: 'subjectId', label: 'Subject ID', fullWidth: true },
          { name: 'facultyName', label: 'Faculty' },
          { name: 'facultyId', label: 'Faculty ID' },
          { name: 'classroom', label: 'Classroom / Lab' },
        ]}
      />
    </div>
  )
}
