import { useMemo } from 'react'
import { Clock } from '@phosphor-icons/react'
import { PageHeader, Panel } from '../../components/ui/primitives'
import { useCollection } from '../../hooks/useCollection'
import { useMe } from '../../hooks/useMe'
import TimetableGrid from '../../components/TimetableGrid'

export default function StudentTimetable() {
  const { me } = useMe()
  const timetable = useCollection('timetable')

  const mine = useMemo(() => timetable.data.filter((t) => t.semester === me?.semester), [timetable.data, me])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academics"
        title="My timetable"
        description={`Weekly class schedule — BCA Sem ${me?.semester}, Section ${me?.section}`}
        actions={
          <span className="badge badge-indigo inline-flex items-center gap-1.5">
            <Clock size={13} weight="bold" /> {mine.length} sessions
          </span>
        }
      />
      <Panel title="Weekly schedule" subtitle="Today is highlighted">
        <TimetableGrid data={mine} />
      </Panel>
    </div>
  )
}
