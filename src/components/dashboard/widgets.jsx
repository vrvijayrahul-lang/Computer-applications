import { useMemo } from 'react'
import { CalendarBlank, MapPin, Clock, Megaphone, PushPin } from '@phosphor-icons/react'
import { useCollection } from '../../hooks/useCollection'
import { ChartPanel, TrendChart, BarsChart, DonutChart, Legend, STATUS_TONES } from '../charts/ChartKit'
import { Badge, EmptyState } from '../ui/primitives'
import { fmtDate, fmtShort, fmtTime, pct } from '../../utils/format'

const toneFor = (cat) =>
  cat === 'Holiday' ? 'amber'
    : cat === 'Examination' ? 'rose'
      : cat === 'Placement' ? 'mint'
        : cat === 'Event' || cat === 'Seminar' ? 'indigo' : 'slate'

/* ------------------------- Notices feed --------------------------- */
export function NoticesFeed({ limit = 5, emptyTitle = 'No notices' }) {
  const { data } = useCollection('notices', { sortBy: 'date', sortDir: 'desc' })
  const rows = data.slice(0, limit)
  if (!rows.length) return <EmptyState icon={Megaphone} title={emptyTitle} hint="New circulars will appear here." />
  return (
    <div className="divide-y divide-black/5 dark:divide-white/5">
      {rows.map((n) => (
        <div key={n.id} className="py-3.5 first:pt-0 last:pb-0">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent-500/10 border border-accent-500/15 flex items-center justify-center text-accent-500 shrink-0 mt-0.5">
              <Megaphone size={15} weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {n.pinned && <PushPin size={13} weight="fill" className="text-amber-500 shrink-0" />}
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 leading-snug">{n.title}</p>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] text-zinc-500 dark:text-white/45 leading-relaxed">{n.body}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge tone={toneFor(n.category)}>{n.category}</Badge>
                <span className="text-[10.5px] text-zinc-400 dark:text-white/30">{fmtDate(n.date)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------- Upcoming events ------------------------ */
export function UpcomingEvents({ limit = 4 }) {
  const { data } = useCollection('events', { sortBy: 'date', sortDir: 'asc' })
  const now = new Date().toISOString()
  const upcoming = data.filter((e) => e.date >= now).slice(0, limit)
  if (!upcoming.length) return <EmptyState icon={CalendarBlank} title="No upcoming events" />
  return (
    <div className="space-y-3">
      {upcoming.map((e) => (
        <div key={e.id} className="flex items-center gap-4 rounded-2xl border border-black/5 dark:border-white/8 bg-black/[0.015] dark:bg-white/[0.03] p-3.5 hover:border-accent-500/30 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent-500 to-violet-600 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-accent-500/20">
            <span className="text-[16px] font-bold leading-none">{new Date(e.date).getDate()}</span>
            <span className="text-[9px] uppercase tracking-wider mt-0.5">{new Date(e.date).toLocaleString('en', { month: 'short' })}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 truncate">{e.title}</p>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400 dark:text-white/40">
              <span className="inline-flex items-center gap-1"><MapPin size={11} /> {e.venue}</span>
              <span className="inline-flex items-center gap-1"><Clock size={11} /> {fmtTime(e.date)}</span>
            </div>
          </div>
          <Badge tone="indigo">{e.category}</Badge>
        </div>
      ))}
    </div>
  )
}

/* ------------------------- Today's classes ------------------------ */
const DAY_NAME = () => new Date().toLocaleDateString('en-US', { weekday: 'long' })

export function TodayClasses({ semester, facultyId, limit = 6, showHeader = true }) {
  const { data } = useCollection('timetable')
  const today = DAY_NAME()
  const rows = useMemo(
    () => data.filter((t) => t.day === today && (!semester || t.semester === semester) && (!facultyId || t.facultyId === facultyId)).sort((a, b) => a.period - b.period),
    [data, semester, facultyId, today],
  ).slice(0, limit)

  return (
    <ChartPanel title={showHeader ? "Today's classes" : undefined} subtitle={showHeader ? `${today} · ${rows.length} session${rows.length === 1 ? '' : 's'}` : undefined} height={undefined}>
      {rows.length ? (
        <div className="space-y-2.5">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center gap-3.5 rounded-2xl border border-black/5 dark:border-white/8 bg-black/[0.015] dark:bg-white/[0.03] px-3.5 py-3 hover:border-accent-500/30 transition-colors">
              <div className="h-10 w-14 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-[11px] font-bold text-accent-600 dark:text-accent-400 shrink-0">P{t.period}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-white/90 truncate">{t.subjectName}</p>
                <p className="text-[11px] text-zinc-400 dark:text-white/40 mt-0.5">{t.facultyName} · Sem {t.semester} {t.classroom}</p>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-white/50 shrink-0">{t.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarBlank} title="No classes today" hint="Enjoy the break — no scheduled sessions." />
      )}
    </ChartPanel>
  )
}

/* --------------------- Attendance weekly trend --------------------- */
export function AttendanceTrend({ days = 8 }) {
  const { data } = useCollection('attendance', { sortBy: 'date', sortDir: 'asc' })
  const rows = useMemo(() => {
    const byDate = new Map()
    data.forEach((a) => {
      const key = a.date.slice(0, 10)
      if (!byDate.has(key)) byDate.set(key, { present: 0, absent: 0, late: 0, date: a.date })
      Object.entries(a.records || {}).forEach(([, v]) => { byDate.get(key)[v] = (byDate.get(key)[v] || 0) + 1 })
    })
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-days)
      .map(([key, v]) => {
        const total = v.present + v.absent + v.late || 1
        return { day: fmtShort(v.date), present: pct(v.present, total), absent: pct(v.absent, total), late: pct(v.late, total), total: v.present + v.absent + v.late }
      })
  }, [data, days])

  return (
    <ChartPanel
      title="Attendance trend"
      subtitle="Daily attendance % · last few sessions"
      legend={<Legend items={[{ name: 'Present', color: STATUS_TONES.present }, { name: 'Absent', color: STATUS_TONES.absent }, { name: 'Late', color: STATUS_TONES.late }]} />}
    >
      <TrendChart data={rows} xKey="day" series={[
        { key: 'present', name: 'present', color: STATUS_TONES.present },
        { key: 'absent', name: 'absent', color: STATUS_TONES.absent },
        { key: 'late', name: 'late', color: STATUS_TONES.late },
      ]} />
    </ChartPanel>
  )
}

/* -------------------- Students by semester (bar) ------------------- */
export function StudentsBySemester() {
  const { data } = useCollection('students')
  const rows = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    data.forEach((s) => { if (counts[s.semester] != null) counts[s.semester]++ })
    return [1, 2, 3, 4, 5, 6].map((sem) => ({ semester: `Sem ${sem}`, count: counts[sem] }))
  }, [data])
  return (
    <ChartPanel title="Students by semester" subtitle="Distribution across BCA semesters">
      <BarsChart data={rows} xKey="semester" series={[{ key: 'count', name: 'Students', color: '#6366f1' }]} />
    </ChartPanel>
  )
}

/* ------------------------- Status donut ---------------------------- */
export function StatusDonut({ attendance, title = 'Today' }) {
  const { data: all } = useCollection('attendance')
  const rows = attendance ?? all
  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0 }
    rows.forEach((a) => Object.entries(a.records || {}).forEach(([, v]) => { if (c[v] != null) c[v]++ }))
    return c
  }, [rows])
  const total = counts.present + counts.absent + counts.late
  const donut = [
    { name: 'Present', value: counts.present, color: STATUS_TONES.present },
    { name: 'Absent', value: counts.absent, color: STATUS_TONES.absent },
    { name: 'Late', value: counts.late, color: STATUS_TONES.late },
  ]
  return (
    <ChartPanel
      title={`Attendance · ${title}`}
      subtitle="Present / absent / late"
      legend={<Legend items={donut.map((d) => ({ name: d.name, color: d.color }))} />}
    >
      <DonutChart data={donut} centerValue={total ? `${pct(counts.present, total)}%` : '—'} centerLabel="present" />
    </ChartPanel>
  )
}

/* ----------------------- Marks by subject (bar) --------------------- */
export function MarksBySubject({ studentId, title = 'Internal marks by subject' }) {
  const { data } = useCollection('marks')
  const rows = useMemo(() => {
    if (!studentId) return []
    const bySubj = new Map()
    data.filter((m) => m.studentId === studentId).forEach((m) => {
      if (!bySubj.has(m.subjectName)) bySubj.set(m.subjectName, { total: 0, max: 0, n: 0 })
      const s = bySubj.get(m.subjectName)
      s.total += m.marksObtained; s.max += m.maxMarks; s.n++
    })
    return [...bySubj.entries()].map(([name, s]) => ({
      subject: name.length > 18 ? name.slice(0, 17) + '…' : name,
      score: Math.round((s.total / s.max) * 100),
    }))
  }, [data, studentId])

  if (!rows.length) return <ChartPanel title={title}><EmptyState icon={CalendarBlank} title="No marks yet" hint="Marks appear after faculty enters internal examinations." /></ChartPanel>

  return (
    <ChartPanel title={title} subtitle="Percentage across subjects" legend={<Legend items={[{ name: 'Score %', color: '#059669' }]} />}>
      <BarsChart data={rows} xKey="subject" series={[{ key: 'score', name: 'Score %', color: '#059669' }]} height={300} />
    </ChartPanel>
  )
}
