import { useEffect, useState } from 'react'

export default function PartageBoutique({ boutique, onClose }) {
  const [copie, setCopie] = useState(false)
  const lien = `${window.location.origin}/b/${boutique.id}`
  const messagePromo = `🛍️ Découvre ma boutique "${boutique.nom}" sur ShopGN — ${boutique.description || 'des produits d\'exception'} 🔗 ${lien}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&bgcolor=070d1c&color=e5c357&margin=12&data=${encodeURIComponent(lien)}`

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch (e) {
      const el = document.createElement('textarea')
      el.value = lien
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    }
  }

  const copierMessage = async () => {
    try { await navigator.clipboard.writeText(messagePromo); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch (e) {}
  }

  const partageNatif = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: boutique.nom,
          text: messagePromo,
          url: lien,
        })
      } catch (e) { /* user cancelled */ }
    } else {
      copierMessage()
    }
  }

  const telechargerQR = async () => {
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-shopgn-${boutique.nom.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error('QR download:', e) }
  }

  const liensReseaux = [
    {
      nom: 'WhatsApp', emoji: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(messagePromo)}`,
    },
    {
      nom: 'Facebook', emoji: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lien)}&quote=${encodeURIComponent(messagePromo)}`,
    },
    {
      nom: 'X / Twitter', emoji: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messagePromo)}`,
    },
    {
      nom: 'Telegram', emoji: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(lien)}&text=${encodeURIComponent(messagePromo)}`,
    },
    {
      nom: 'Email', emoji: '✉️',
      url: `mailto:?subject=${encodeURIComponent('Découvre ma boutique sur ShopGN')}&body=${encodeURIComponent(messagePromo)}`,
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-navy-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-navy border border-gold-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full my-8 shadow-card-dark"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-1">
              · Partage ·
            </p>
            <h2 className="font-display text-3xl text-gold-shine">Ta boutique en lumière</h2>
            <p className="text-navy-200/70 text-sm mt-1 font-display italic">
              Partage ce lien pour gagner en visibilité
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-navy-800 border border-navy-600 text-navy-100/80 w-9 h-9 rounded-full flex items-center justify-center hover:bg-navy-700 transition flex-shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* QR code */}
        <div className="bg-navy-900 border-2 border-gold-500/30 rounded-2xl p-4 mb-5 flex flex-col items-center">
          <img
            src={qrUrl}
            alt="QR Code de la boutique"
            className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl"
          />
          <p className="font-display italic text-navy-200/70 text-xs mt-3 text-center">
            Scanne pour ouvrir « {boutique.nom} »
          </p>
          <button
            onClick={telechargerQR}
            className="mt-3 bg-navy-800 border border-gold-500/30 text-gold-300 px-4 py-1.5 rounded-full text-xs font-sans hover:bg-navy-700 transition"
          >
            ⬇ Télécharger le QR
          </button>
        </div>

        {/* Lien à copier */}
        <div className="mb-5">
          <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mb-2 font-sans">Ton lien unique</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={lien}
              readOnly
              onClick={(e) => e.target.select()}
              className="input-dark flex-1 rounded-lg px-3 py-2.5 text-xs font-sans truncate"
            />
            <button
              onClick={copier}
              className={`px-4 py-2.5 rounded-lg text-xs font-sans tracking-wide transition whitespace-nowrap ${
                copie ? 'bg-emerald-600 text-white' : 'btn-gold'
              }`}
            >
              {copie ? '✓ Copié' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Partage natif (mobile) */}
        <button
          onClick={partageNatif}
          className="btn-gold w-full py-3 rounded-full text-sm tracking-wide mb-3"
        >
          📤 Partager ma boutique
        </button>

        {/* Réseaux */}
        <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mb-3 mt-5 text-center font-sans">
          · ou partage sur ·
        </p>
        <div className="grid grid-cols-5 gap-2">
          {liensReseaux.map(r => (
            <a
              key={r.nom}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              title={r.nom}
              className="aspect-square flex flex-col items-center justify-center bg-navy-800 border border-navy-700 rounded-xl hover:border-gold-500/40 hover:bg-navy-700 transition group"
            >
              <span className="text-2xl mb-1">{r.emoji}</span>
              <span className="text-[9px] text-navy-200/60 group-hover:text-gold-300 font-sans">{r.nom.split(' ')[0]}</span>
            </a>
          ))}
        </div>

        {/* Message promo */}
        <div className="mt-5 bg-navy-900 border border-gold-500/15 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] tracking-widest uppercase text-gold-400/70 font-sans">Message prêt à partager</p>
            <button
              onClick={copierMessage}
              className="text-[10px] tracking-wider uppercase text-gold-300 hover:text-gold-200 font-sans"
            >
              Copier le texte
            </button>
          </div>
          <p className="text-navy-100/85 text-xs leading-relaxed font-sans">{messagePromo}</p>
        </div>
      </div>
    </div>
  )
}
