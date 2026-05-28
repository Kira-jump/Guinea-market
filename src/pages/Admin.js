import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApercuAdmin from '../components/admin/ApercuAdmin'
import UtilisateursAdmin from '../components/admin/UtilisateursAdmin'
import BoutiquesAdmin from '../components/admin/BoutiquesAdmin'
import ProduitsAdmin from '../components/admin/ProduitsAdmin'
import CorbeilleAdmin from '../components/admin/CorbeilleAdmin'

const ONGLETS = [
  { id: 'apercu', label: 'Aperçu', icon: '📊' },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { id: 'boutiques', label: 'Boutiques', icon: '🏪' },
  { id: 'produits', label: 'Produits', icon: '📦' },
  { id: 'corbeille', label: 'Corbeille', icon: '🗑️' },
]

export default function Admin() {
  const [onglet, setOnglet] = useState('apercu')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) navigate('/admin-login')
  }, [navigate])

  const deconnexion = () => {
    localStorage.removeItem('admin_auth')
    navigate('/admin-login')
  }

  return (
    <div className="min-h-screen bg-navy-950 text-navy-100">
      {/* Header */}
      <div className="glass-navy border-b border-gold-500/15 py-5 px-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-1">
              · Panel privé ·
            </p>
            <h1 className="font-display text-3xl text-gold-shine">Administration</h1>
          </div>
          <button
            onClick={deconnexion}
            className="bg-red-900/30 border border-red-500/30 text-red-300 px-5 py-2 rounded-full text-sm font-sans hover:bg-red-900/50 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-navy border-b border-gold-500/10 sticky top-[85px] z-20">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {ONGLETS.map(o => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`flex-shrink-0 px-4 py-4 text-xs sm:text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
                onglet === o.id
                  ? 'border-gold-500 text-gold-300'
                  : 'border-transparent text-navy-200/60 hover:text-navy-100'
              }`}
            >
              <span className="mr-1.5">{o.icon}</span>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {onglet === 'apercu' && <ApercuAdmin />}
        {onglet === 'utilisateurs' && <UtilisateursAdmin />}
        {onglet === 'boutiques' && <BoutiquesAdmin />}
        {onglet === 'produits' && <ProduitsAdmin />}
        {onglet === 'corbeille' && <CorbeilleAdmin />}
      </div>
    </div>
  )
}
