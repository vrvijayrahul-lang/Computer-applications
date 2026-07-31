import { useMemo, useState } from 'react'
import { CaretDown, CaretUp, CaretRight, CaretLeft, DownloadSimple, PencilSimple, TrashSimple, ArrowsDownUp } from '@phosphor-icons/react'
import { SearchInput, Spinner, EmptyState, Button } from './primitives'
import { exportExcel } from '../../utils/export'

const PAGE_SIZE = 8

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  searchKeys = [],
  onEdit,
  onDelete,
  rowKey = 'id',
  emptyTitle = 'No records found',
  emptyHint,
  exportName = 'export',
  toolbar,
  rowClick,
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState(null)

  const filtered = useMemo(() => {
    let rows = data
    if (query && searchKeys.length) {
      const q = query.toLowerCase()
      rows = rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    if (sort) {
      rows = rows.slice().sort((a, b) => {
        const av = a[sort.key]; const bv = b[sort.key]
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av
        return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }
    return rows
  }, [data, query, searchKeys, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const toggleSort = (key) => {
    setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }))
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {searchKeys.length > 0 ? (
          <SearchInput value={query} onChange={(v) => { setQuery(v); setPage(0) }} placeholder={`Search ${searchKeys.length} fields…`} className="w-full sm:w-64" />
        ) : <div />}
        <div className="flex items-center gap-2">
          {toolbar}
          {filtered.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => exportExcel(filtered.map((r) => {
              const o = {}
              columns.forEach((c) => { o[c.label] = c.render ? c.render(r) : r[c.key] })
              return o
            }), exportName)}>
              <DownloadSimple size={14} weight="bold" /> Excel
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState title={emptyTitle} hint={emptyHint} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/8">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
                    className={`py-3 pr-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/35 ${c.sortable === false ? '' : 'cursor-pointer select-none hover:text-zinc-600 dark:hover:text-white/60 transition-colors'} ${c.className || ''}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {c.sortable !== false && (sort?.key === c.key ? (sort.dir === 'asc' ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />) : <ArrowsDownUp size={11} className="opacity-40" />)}
                    </span>
                  </th>
                ))}
                {(onEdit || onDelete) && <th className="py-3 text-right text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/35">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr
                  key={row[rowKey]}
                  onClick={() => rowClick?.(row)}
                  className={`group border-b border-black/[0.04] dark:border-white/[0.04] transition-colors ${rowClick ? 'cursor-pointer hover:bg-accent-500/[0.04]' : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.02]'}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`py-3.5 pr-4 text-[13px] text-zinc-700 dark:text-white/75 ${c.className || ''}`}>
                      {c.render ? c.render(row, i) : row[c.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button onClick={(e) => { e.stopPropagation(); onEdit(row) }} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all" title="Edit">
                            <PencilSimple size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={(e) => { e.stopPropagation(); onDelete(row) }} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Delete">
                            <TrashSimple size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-black/5 dark:border-white/8 pt-4">
          <span className="text-[12px] text-zinc-400 dark:text-white/40">
            {filtered.length} record{filtered.length === 1 ? '' : 's'} · page {safePage + 1}/{pages}
          </span>
          <div className="flex gap-1.5">
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <CaretLeft size={14} />
            </button>
            <button disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
