// Chart kit built on Recharts — applies the validated categorical palette and
// the dataviz rules: thin 2px marks, recessive grid, neutral ink for text,
// always a legend for 2+ series, glass tooltip.
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

// Validated against the dataviz six-checks (light + dark). Fixed order, never cycled.
export const CAT_PALETTE = ['#6366f1', '#d97706', '#059669', '#ec4899', '#a855f7', '#0284c7']
export const STATUS_TONES = { present: '#10b981', absent: '#f43f5e', late: '#f59e0b' }

export function useChartTheme() {
  const { dark } = useTheme()
  return {
    dark,
    text: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    axis: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
  }
}

const withColors = (series) => series.map((s, i) => ({ ...s, color: s.color || CAT_PALETTE[i % CAT_PALETTE.length] }))

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/95 glass px-4 py-3 shadow-ambient">
      {label != null && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">{label}</p>}
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-[12px] text-white/55 capitalize">{p.name}:</span>
            <span className="text-[12px] font-bold text-white">{formatter ? formatter(p.value) : p.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.name} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-white/50">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  )
}

export function ChartPanel({ title, subtitle, legend, height = 264, children, actions }) {
  return (
    <div className="card-shell card-hover">
      <div className="card p-5 sm:p-6 flex flex-col">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12px] text-zinc-500 dark:text-white/40">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {legend}
            {actions}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Area --------------------------------- */
export function TrendChart({ data, xKey, series, height = 264 }) {
  const th = useChartTheme()
  const colored = withColors(series)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          {colored.map((s) => (
            <linearGradient key={s.key} id={`grad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={th.grid} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: th.text, fontSize: 11 }} dy={6} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: th.text, fontSize: 11 }} width={42} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: th.axis, strokeWidth: 1 }} />
        {colored.map((s) => (
          <Area
            key={s.key} type="monotone" dataKey={s.key} name={s.name}
            stroke={s.color} strokeWidth={2} fill={`url(#grad_${s.key})`}
            dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------- Bar ---------------------------------- */
export function BarsChart({ data, xKey, series, height = 264, stacked = false, layout = 'horizontal', radius = [6, 6, 0, 0] }) {
  const th = useChartTheme()
  const colored = withColors(series)
  const vertical = layout === 'vertical'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={vertical ? { top: 6, right: 6, left: 8, bottom: 0 } : { top: 6, right: 6, left: -18, bottom: 0 }} barCategoryGap="26%">
        <CartesianGrid vertical={false} stroke={th.grid} />
        {vertical ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: th.text, fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: th.text, fontSize: 11 }} width={84} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: th.text, fontSize: 11 }} dy={6} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: th.text, fontSize: 11 }} width={42} allowDecimals={false} />
          </>
        )}
        <Tooltip content={<ChartTooltip />} cursor={{ fill: th.grid }} />
        {colored.map((s) => (
          <Bar
            key={s.key} dataKey={s.key} name={s.name} fill={s.color}
            stackId={stacked ? 'a' : undefined} radius={stacked ? undefined : radius}
            maxBarSize={stacked ? 26 : 44}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------- Donut --------------------------------- */
export function DonutChart({ data, height = 232, centerValue, centerLabel }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={3} cornerRadius={8} strokeWidth={0}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || CAT_PALETTE[i % CAT_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue != null || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-1">
          <span className="text-[26px] font-bold leading-none text-zinc-900 dark:text-white">{centerValue}</span>
          {centerLabel && <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-white/40">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
