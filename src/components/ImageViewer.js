import { useEffect } from 'react'

export default function ImageViewer({ image, nom, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const telecharger = async () => {
    const response = await fetch(image)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nom}.jpg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 bg-navy-950/95 backdrop-blur-md z-50 flex flex-col"
      onClick={onClose}
    >
      <div className="flex justify-between items-center px-4 py-4 z-10 border-b border-gold-500/15 glass-navy">
        <p className="text-gold-300 font-display text-base truncate flex-1">{nom}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); telecharger() }}
            className="bg-navy-800 border border-gold-500/30 text-gold-300 px-4 py-2 rounded-full text-sm font-sans hover:bg-navy-700 transition"
          >
            Télécharger
          </button>
          <button
            onClick={onClose}
            className="bg-navy-800 border border-navy-600 text-navy-100/80 w-9 h-9 rounded-full flex items-center justify-center hover:bg-navy-700 transition text-lg"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt={nom}
          className="max-w-full max-h-full object-contain rounded-2xl"
        />
      </div>
    </div>
  )
}
