import { useMemo } from 'react'
import { GraduationCap, ChalkboardTeacher, CheckCircle, Clock, CalendarStar } from '@phosphor-icons/react'
import { useCollection } from '../../hooks/useCollection'
import { StatCard } from '../../components/ui/primitives'
import { ChartPanel, BarsChart, DonutChart, Legend, CAT_PALETTE } from '../../components/charts/ChartKit'
import { AttendanceTrend, StudentsBySemester, StatusDonut, TodayClasses, UpcomingEvents } from '../../components/dashboard/widgets'
import { pct } from '../../utils/format'

export default function HodDashboard() {
  const students = useCollection('students')
  const faculty = useCollection('faculty')
  const attendance = useCollection('attendance')
  const timetable = useCollection('timetable')
  const events = useCollection('events')

  const avgAttendance = useMemo(() => {
    let present = 0, total = 0
    attendance.data.forEach((a) => Object.values(a.records || {}).forEach((v) => { total++; if (v === 'present') present++ }))
    return total ? pct(present, total) : 0
  }, [attendance.data])

  const todayClasses = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return timetable.data.filter((t) => t.day === today).length
  }, [timetable.data])

  const upcomingEvents = useMemo(() => events.data.filter((e) => e.date >= new Date().toISOString()).length, [events.data])

  const facultyByDesignation = useMemo(() => {
    const map = new Map()
    faculty.data.forEach((f) => map.set(f.designation, (map.get(f.designation) || 0) + 1))
    return [...map.entries()].map(([name, value], i) => ({ name, value, color: CAT_PALETTE[i % CAT_PALETTE.length] }))
  }, [faculty.data])

  return (
    <div className="space-y-6">
      <div className="motion-fade-up">
        <span className="eyebrow mb-3">Head of Department</span>
        <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back, HOD</h1>
        <p className="mt-1.5 text-[13.5px] text-zinc-500 dark:text-white/45">Department health, student performance and today's schedule.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 stagger">
        <StatCard label="Students" value={students.data.length} icon={GraduationCap} accent="indigo" hint="across 6 semesters" />
        <StatCard label="Faculty" value={faculty.data.length} icon={ChalkboardTeacher} accent="sky" hint="6 designations" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} icon={CheckCircle} accent="mint" delta={1.5} deltaTone="up" hint="all sessions" />
        <StatCard label="Classes Today" value={todayClasses} icon={Clock} accent="amber" hint="scheduled" />
        <StatCard label="Upcoming Events" value={upcomingEvents} icon={CalendarStar} accent="rose" hint="next 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><AttendanceTrend /></div>
        <ChartPanel title="Faculty composition" subtitle="By designation" legend={<Legend items={facultyByDesignation.map((d) => ({ name: d.name, color: d.color }))} />}>
          <DonutChart data={facultyByDesignation} centerValue={faculty.data.length} centerLabel="faculty" />
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1"><StudentsBySemester /></div>
        <div className="lg:col-span-1"><TodayClasses limit={5} /></div>
        <StatusDonut title="Latest session" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><UpcomingEvents limit={3} /></div>
        <div className="lg:col-span-1">
          <ChartPanel title="Student distribution" subtitle="Semester-wise intake" >
            <BarsChart data={[
              { s: '1', v: students.data.filter((x) => x.semester === 1).length },
              { s: '2', v: students.data.filter((x) => x.semester === 2).length },
              { s: '3', v: students.data.filter((x) => x.semester === 3).length },
              { s: '4', v: students.data.filter((x) => x.semester === 4).length },
              { s: '5', v: students.data.filter((x) => x.semester === 5).length },
              { s: '6', v: students.data.filter((x) => x.semester === 6).length },
            ]} xKey="s" series={[{ key: 'v', name: 'Students', color: '#d97706' }]} height={232} />
          </ChartPanel>
        </div>
      </div>
    </div>
  )
}
