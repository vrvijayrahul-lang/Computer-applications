import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from '@phosphor-icons/react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => dismiss(id), 3800)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="motion-fade-up pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/95 glass px-4 py-3 shadow-ambient min-w-[260px] max-w-sm">
            {t.type === 'success' && <CheckCircle size={20} className="text-mint-400 shrink-0" weight="bold" />}
            {t.type === 'error' && <XCircle size={20} className="text-rose-glow shrink-0" weight="bold" />}
            {t.type === 'info' && <Info size={20} className="text-accent-400 shrink-0" weight="bold" />}
            <span className="text-[13px] font-medium text-white/90 flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white/80 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
