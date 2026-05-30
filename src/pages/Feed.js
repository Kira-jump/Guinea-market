import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CarteBoutique from '../components/CarteBoutique'

export default function Feed() {
  const [boutiques, setBoutiques] = useState([])
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('boutiques')
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchFeed = useCallback(async () => {
    if (!user) return
    const { data: follows } = await supabase
      .from('followers').select('boutique_id').eq('user_id', user.id)

    if (!follows || follows.length === 0) {
      setLoading(false)
      return
    }

    const boutiqueIds = follows.map(f => f.boutique_id)

    const { data: boutiquesData } = await supabase
      .from('boutiques').select('*').in('id', boutiqueIds)
      .order('created_at', { ascending: false })
    setBoutiques(boutiquesData || [])

    const { data: produitsData } = await supabase
      .from('produits')
      .select('*, boutiques(nom, logo_url, whatsapp)')
      .in('boutique_id', boutiqueIds)
      .order('created_at', { ascending: false })
      .limit(20)
    setProduits(produitsData || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    fetchFeed()
  }, [user, navigate, fetchFeed])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Chargement…
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gold-500/15">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-3">
            · Ton univers ·
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-gold-shine">Mon Feed</h1>
          <p className="text-navy-200/70 font-display italic mt-2">
            Les boutiques &amp; nouveautés que tu suis
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="glass-navy border-b border-gold-500/10 sticky top-[73px] z-30">
        <div className="max-w-6xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('boutiques')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'boutiques' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            🏪 Boutiques ({boutiques.length})
          </button>
          <button
            onClick={() => setOnglet('produits')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'produits' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            📦 Nouveautés ({produits.length})
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {boutiques.length === 0 ? (
          <div className="text-center py-24 text-navy-200/60">
            <p className="text-5xl mb-4">🏪</p>
            <p className="font-display text-2xl italic mb-2">Ton feed est vide</p>
            <p className="text-sm mb-6 font-sans">Suis des boutiques pour voir leurs nouveautés ici</p>
            <button onClick={() => navigate('/')} className="btn-gold px-7 py-3 rounded-full text-sm tracking-wide">
              Découvrir des boutiques
            </button>
          </div>
        ) : (
          <>
            {onglet === 'boutiques' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {boutiques.map(boutique => (
                  <CarteBoutique key={boutique.id} boutique={boutique} userId={user?.id} />
                ))}
              </div>
            )}

            {onglet === 'produits' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {produits.map(produit => (
                  <div
                    key={produit.id}
                    className="group bg-navy-800/50 rounded-2xl overflow-hidden border border-navy-700 hover:border-gold-500/40 hover:shadow-card-dark transition-all duration-300"
                  >
                    <div className="relative overflow-hidden bg-navy-900" style={{ paddingBottom: '110%' }}>
                      {produit.image_url ? (
                        <img src={produit.image_url} alt={produit.nom} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-navy-600 text-5xl">📦</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div
                        onClick={() => navigate(`/boutique/${produit.boutique_id}`)}
                        className="flex items-center gap-1.5 mb-2 cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-full bg-navy-900 overflow-hidden flex-shrink-0 border border-gold-500/30">
                          {produit.boutiques?.logo_url ? (
                            <img src={produit.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : <span className="text-xs">🏪</span>}
                        </div>
                        <span className="text-xs text-navy-200/60 hover:text-gold-300 truncate font-sans">
                          {produit.boutiques?.nom}
                        </span>
                      </div>
                      <h3 className="font-display text-base text-navy-100 line-clamp-1">{produit.nom}</h3>
                      <p className="text-gold-shine font-display text-lg font-semibold mt-1">
                        {produit.prix.toLocaleString()} GNF
                      </p>
                      <a
                        href={`https://wa.me/${produit.boutiques?.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-emerald block mt-3 text-xs text-center py-2 rounded-lg"
                      >
                        Commander
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
