import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} animate-modal-in`}>
        <div className="card-shell !rounded-t-[1.5rem] sm:!rounded-[1.75rem] !bg-white dark:!bg-ink-900 border border-black/10 dark:border-white/10">
          <div className="card !rounded-t-[calc(1.5rem-6px)] sm:!rounded-[calc(1.75rem-6px)] max-h-[85dvh] overflow-y-auto p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                {title && <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h2>}
                {subtitle && <p className="mt-1 text-[12.5px] text-zinc-500 dark:text-white/45">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={15} weight="bold" />
              </button>
            </div>
            {children}
            {footer && <div className="mt-6 flex justify-end gap-2.5 border-t border-black/5 dark:border-white/8 pt-5">{footer}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
