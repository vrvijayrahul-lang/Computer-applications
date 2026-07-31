import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import DataTable from './DataTable'
import Modal from './Modal'
import { Button, PageHeader, StatCard, Spinner } from './primitives'
import { useCollection } from '../../hooks/useCollection'
import { add, update, remove } from '../../services/db'
import { useToast } from '../../context/ToastContext'

/* ------------------------------------------------------------------ */
/* Single form field renderer                                          */
/* ------------------------------------------------------------------ */
export function FormField({ field, value, onChange }) {
  const { name, label, type = 'text', options = [], required, placeholder, hint, disabled } = field
  const base = 'input'

  if (type === 'textarea') {
    return (
      <div>
        <label className="label">{label}{required && <span className="text-rose-500"> *</span>}</label>
        <textarea rows={3} className={base} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(name, e.target.value)} />
        {hint && <p className="mt-1 text-[11px] text-zinc-400">{hint}</p>}
      </div>
    )
  }
  if (type === 'select') {
    return (
      <div>
        <label className="label">{label}{required && <span className="text-rose-500"> *</span>}</label>
        <select className={`${base} pr-8`} value={value ?? ''} disabled={disabled} onChange={(e) => onChange(name, e.target.value)}>
          <option value="">— Select —</option>
          {options.map((o) => {
            const v = typeof o === 'object' ? o.value : o
            const l = typeof o === 'object' ? o.label : o
            return <option key={v} value={v}>{l}</option>
          })}
        </select>
      </div>
    )
  }
  if (type === 'toggle') {
    return (
      <label className="flex items-center gap-3 cursor-pointer pt-1">
        <button type="button" onClick={() => onChange(name, !value)} className={`h-6 w-11 rounded-full transition-all duration-300 ${value ? 'bg-accent-500' : 'bg-zinc-300 dark:bg-white/15'} relative`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-[13px] font-medium text-zinc-700 dark:text-white/75">{label}</span>
      </label>
    )
  }
  return (
    <div>
      <label className="label">{label}{required && <span className="text-rose-500"> *</span>}</label>
      <input type={type === 'email' ? 'email' : type === 'number' ? 'number' : type === 'date' || type === 'datetime-local' ? type : 'text'} className={base} value={value ?? ''} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(name, type === 'number' ? Number(e.target.value) : e.target.value)} />
      {hint && <p className="mt-1 text-[11px] text-zinc-400">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Config-driven CRUD page                                             */
/* ------------------------------------------------------------------ */
export default function CrudPage({
  collection,
  title, eyebrow, description,
  columns, formFields = [], searchKeys = [],
  statCards,
  exportName = title?.toLowerCase().replace(/\s+/g, '-'),
  emptyHint,
  extraActions,
  onFormInit,
  onBeforeSave,
  hideAdd = false,
  hideHeader = false,
  filter,
}) {
  const { data: rawData, loading } = useCollection(collection)
  const data = filter ? rawData.filter(filter) : rawData
  const { toast } = useToast()
  const [editing, setEditing] = useState(null) // null | 'new' | doc
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [savingTitle, setSavingTitle] = useState('')

  const defaults = useMemo(() => {
    const o = {}
    formFields.forEach((f) => { o[f.name] = f.type === 'toggle' ? false : f.type === 'number' ? 0 : '' })
    return o
  }, [formFields])

  const openAdd = () => {
    setValues(onFormInit ? onFormInit() : { ...defaults })
    setEditing('new')
  }
  const openEdit = (doc) => {
    setValues({ ...defaults, ...doc })
    setEditing(doc)
  }
  const setField = (name, v) => setValues((s) => ({ ...s, [name]: v }))

  const save = async () => {
    const missing = formFields.filter((f) => f.required && (values[f.name] === '' || values[f.name] == null))
    if (missing.length) {
      toast(`Please fill: ${missing.map((m) => m.label).join(', ')}`, 'error')
      return
    }
    setSaving(true)
    setSavingTitle(editing === 'new' ? 'Adding' : 'Updating')
    try {
      const payload = onBeforeSave ? await onBeforeSave(values) : values
      if (editing === 'new') await add(collection, payload)
      else await update(collection, editing.id, payload)
      toast(editing === 'new' ? 'Added successfully' : 'Changes saved')
      setEditing(null)
    } catch (e) {
      toast(e.message || 'Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await remove(collection, toDelete.id)
      toast('Deleted successfully')
    } catch (e) {
      toast(e.message || 'Delete failed', 'error')
    }
    setToDelete(null)
  }

  return (
    <div>
      {!hideHeader && (
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={extraActions}
        />
      )}

      {statCards && statCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 stagger">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      <div className="card-shell motion-fade-up">
        <div className="card p-4 sm:p-5">
          <DataTable
            data={data}
            loading={loading}
            columns={columns}
            searchKeys={searchKeys}
            onEdit={hideAdd ? undefined : openEdit}
            onDelete={hideAdd ? undefined : setToDelete}
            exportName={exportName}
            emptyHint={emptyHint}
            toolbar={
              !hideAdd && (
                <Button onClick={openAdd}>
                  <Plus size={15} weight="bold" /> Add
                </Button>
              )
            }
          />
        </div>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `Add ${title?.replace(/s$/, '')}` : `Edit ${title?.replace(/s$/, '')}`}
        subtitle={editing === 'new' ? 'Create a new record' : 'Update the details below'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <><Spinner className="!py-0" /> {savingTitle}…</> : editing === 'new' ? 'Create' : 'Save changes'}
            </Button>
          </>
        }
      >
        {editing !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.map((f) => (
              <div key={f.name} className={f.fullWidth ? 'sm:col-span-2' : ''}>
                <FormField field={f} value={values[f.name]} onChange={setField} />
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={toDelete !== null} onClose={() => setToDelete(null)} title="Delete this record?" size="sm">
        <p className="text-[13.5px] text-zinc-500 dark:text-white/55 leading-relaxed">
          This action is permanent{toDelete?.name ? ` — <b>${toDelete.name}</b> will be removed` : ''}. It cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
