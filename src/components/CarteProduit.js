import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ImageViewer from './ImageViewer'

export default function CarteProduit({ produit, whatsapp, estProprietaire, onSupprimer, onModifier }) {
  const [viewerOuvert, setViewerOuvert] = useState(false)
  const [confirmSupprimer, setConfirmSupprimer] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`
  )

  return (
    <>
      <div className="group bg-navy-800/50 rounded-2xl overflow-hidden border border-navy-700 hover:border-gold-500/40 hover:shadow-card-dark transition-all duration-300">
        <div
          className="relative overflow-hidden bg-navy-900 cursor-zoom-in"
          style={{ paddingBottom: '110%' }}
          onClick={() => produit.image_url && setViewerOuvert(true)}
        >
          {produit.image_url ? (
            <img src={produit.image_url} alt={produit.nom} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-navy-600 text-5xl">📦</div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {estProprietaire && (
            <div className="absolute top-2 right-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onModifier(produit)}
                className="bg-navy-900/90 backdrop-blur text-gold-300 w-8 h-8 rounded-full shadow flex items-center justify-center text-xs hover:bg-navy-700 transition border border-gold-500/30"
              >
                ✏️
              </button>
              <button
                onClick={() => setConfirmSupprimer(true)}
                className="bg-navy-900/90 backdrop-blur text-red-300 w-8 h-8 rounded-full shadow flex items-center justify-center text-xs hover:bg-navy-700 transition border border-red-500/30"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-display text-base text-navy-100 line-clamp-1 leading-snug">{produit.nom}</h3>
          {produit.description && (
            <p className="text-navy-200/60 text-xs mt-1 line-clamp-2 font-sans">{produit.description}</p>
          )}
          <p className="text-gold-shine font-display text-lg font-semibold mt-2 tracking-wide">
            {produit.prix.toLocaleString()} GNF
          </p>
          {!estProprietaire && (
            user ? (
              <a
                href={`https://wa.me/${whatsapp}?text=${message}`}
                target="_blank"
                rel="noreferrer"
                className="btn-emerald block mt-3 text-xs text-center py-2.5 rounded-lg font-sans"
              >
                Commander via WhatsApp
              </a>
            ) : (
              <button
                onClick={() => navigate('/connexion')}
                className="block w-full mt-3 bg-navy-700/50 text-navy-100/80 text-xs text-center py-2.5 rounded-lg hover:bg-navy-700 hover:text-gold-300 transition font-sans border border-navy-600"
              >
                Connectez-vous pour commander
              </button>
            )
          )}
        </div>
      </div>

      {confirmSupprimer && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-navy-800 border border-gold-500/30 rounded-2xl p-6 max-w-sm w-full shadow-card-dark">
            <h3 className="font-display text-2xl text-navy-100 mb-2">Supprimer ce produit ?</h3>
            <p className="text-navy-200/70 text-sm mb-5 font-sans">« {produit.nom} » sera définitivement supprimé.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSupprimer(false)}
                className="flex-1 bg-navy-700 text-navy-100 py-2.5 rounded-xl font-sans hover:bg-navy-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => { onSupprimer(produit.id); setConfirmSupprimer(false) }}
                className="flex-1 bg-red-600/90 text-white py-2.5 rounded-xl font-sans hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerOuvert && (
        <ImageViewer
          image={produit.image_url}
          nom={produit.nom}
          onClose={() => setViewerOuvert(false)}
        />
      )}
    </>
  )
}
