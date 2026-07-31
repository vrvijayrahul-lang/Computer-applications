import { useMemo } from 'react'
import { MapPin } from '@phosphor-icons/react'
import { EmptyState } from './ui/primitives'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOT_TIMES = ['09:00', '09:50', '11:00', '11:50', '14:00', '14:50']
const PERIODS = 6

const hueFor = (subject) => {
  const h = subject ? [...subject].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 220
  return h
}

export default function TimetableGrid({ data, showFaculty = true, onCellClick }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const cell = useMemo(() => {
    const map = {}
    data.forEach((t) => { map[`${t.day}-${t.period}`] = t })
    return map
  }, [data])

  if (!data.length) return <EmptyState title="No timetable" hint="Sessions will appear here once the timetable is published." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr>
            <th className="py-3 pr-2 text-left w-[76px]">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/35">Period</span>
            </th>
            {DAYS.map((day) => (
              <th key={day} className={`py-3 px-2 text-left ${day === today ? '' : ''}`}>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${day === today ? 'bg-accent-500/12 text-accent-600 dark:text-accent-400 border border-accent-500/25' : 'text-zinc-400 dark:text-white/35'}`}>
                  {day === today && <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />}
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{day.slice(0, 3)}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PERIODS }, (_, pi) => (
            <tr key={pi}>
              <td className="py-2 pr-2 align-top">
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-zinc-700 dark:text-white/80">P{pi + 1}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-white/30">{SLOT_TIMES[pi]}</span>
                </div>
              </td>
              {DAYS.map((day) => {
                const t = cell[`${day}-${pi + 1}`]
                const h = hueFor(t?.subjectName)
                return (
                  <td key={day} className={`px-1.5 py-2 align-top ${day === today ? 'bg-accent-500/[0.03] rounded-xl' : ''}`}>
                    {t ? (
                      <button
                        onClick={() => onCellClick?.(t)}
                        disabled={!onCellClick}
                        className="w-full text-left rounded-xl border p-2.5 transition-all duration-300 group disabled:cursor-default"
                        style={{
                          background: `linear-gradient(135deg, hsla(${h}, 75%, 55%, 0.12), hsla(${h}, 75%, 55%, 0.05))`,
                          borderColor: `hsla(${h}, 70%, 55%, 0.25)`,
                        }}
                      >
                        <p className="text-[12px] font-bold leading-tight" style={{ color: `hsl(${h}, 55%, 40%)` }}>
                          <span className="dark:hidden">{t.subjectName}</span>
                        </p>
                        <p className="text-[12px] font-bold leading-tight hidden dark:block" style={{ color: `hsl(${h}, 80%, 75%)` }}>{t.subjectName}</p>
                        {showFaculty && <p className="mt-1 text-[10px] text-zinc-500 dark:text-white/45 truncate">{t.facultyName}</p>}
                        <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-zinc-400 dark:text-white/35">
                          <MapPin size={9} /> {t.classroom}
                        </p>
                      </button>
                    ) : (
                      <div className="h-full rounded-xl border border-dashed border-black/8 dark:border-white/8" />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
