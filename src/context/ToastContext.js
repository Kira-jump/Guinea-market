import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext({ toast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const toast = useCallback(({ titre, message, icone, lien, dureeMs = 4500 }) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, titre, message, icone, lien }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, dureeMs)
    return id
  }, [])

  const fermer = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => { if (t.lien) window.location.href = t.lien; fermer(t.id) }}
            className="pointer-events-auto glass-navy border border-gold-500/30 rounded-2xl p-4 shadow-card-dark animate-[slideIn_0.3s_ease-out] cursor-pointer hover:border-gold-500/60 transition group"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{t.icone || '🔔'}</span>
              <div className="flex-1 min-w-0">
                {t.titre && <p className="font-display text-base text-gold-shine truncate">{t.titre}</p>}
                <p className="text-sm text-navy-100 font-sans leading-relaxed line-clamp-2">{t.message}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); fermer(t.id) }}
                className="text-navy-200/60 hover:text-navy-100 text-sm flex-shrink-0"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
