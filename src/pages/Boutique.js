import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CarteProduit from '../components/CarteProduit'
import Avis from '../components/Avis'
import PartageBoutique from '../components/PartageBoutique'

export default function Boutique() {
  const [boutique, setBoutique] = useState(null)
  const [produits, setProduits] = useState([])
  const [suivi, setSuivi] = useState(false)
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('produits')
  const [partageOuvert, setPartageOuvert] = useState(false)
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchBoutique = useCallback(async () => {
    const { data } = await supabase.from('boutiques').select('*').eq('id', id).single()
    setBoutique(data)
    setLoading(false)
    if (data) {
      await supabase.from('vues').insert({ boutique_id: id, visiteur_id: user?.id || null })
    }
  }, [id, user])

  const fetchProduits = useCallback(async () => {
    const { data } = await supabase
      .from('produits').select('*').eq('boutique_id', id)
      .order('created_at', { ascending: false })
    setProduits(data || [])
  }, [id])

  const verifierSuivi = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows').select('id')
      .eq('acheteur_id', user.id).eq('boutique_id', id)
      .maybeSingle()
    setSuivi(!!data)
  }, [user, id])

  useEffect(() => {
    fetchBoutique()
    fetchProduits()
    if (user) verifierSuivi()
  }, [user, fetchBoutique, fetchProduits, verifierSuivi])

  const toggleSuivi = async () => {
    if (!user) { navigate('/connexion'); return }
    if (suivi) {
      await supabase.from('follows')
        .delete().eq('acheteur_id', user.id).eq('boutique_id', id)
      setBoutique({ ...boutique, followers_count: boutique.followers_count - 1 })
    } else {
      await supabase.from('follows').insert({ acheteur_id: user.id, boutique_id: id })
      setBoutique({ ...boutique, followers_count: boutique.followers_count + 1 })
      await supabase.from('notifications').insert({
        user_id: boutique.vendeur_id,
        type: 'follow',
        message: `Quelqu'un a commencé à suivre ta boutique "${boutique.nom}" !`,
        lien: `/dashboard`
      })
    }
    setSuivi(!suivi)
  }

  const supprimerProduit = async (produitId) => {
    await supabase.from('produits').delete().eq('id', produitId)
    setProduits(produits.filter(p => p.id !== produitId))
  }

  const estProprietaire = user && boutique && user.id === boutique.vendeur_id

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Chargement…
    </div>
  )

  if (!boutique) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Boutique introuvable
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero boutique */}
      <div className="relative overflow-hidden border-b border-gold-500/15">
        <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-navy-800 flex items-center justify-center overflow-hidden border-2 border-gold-500/50 shadow-gold-glow flex-shrink-0">
              {boutique.logo_url ? (
                <img src={boutique.logo_url} alt={boutique.nom} className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy-200/50 text-xs font-sans">Logo</span>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2">
                · Maison ·
              </p>
              <h1 className="font-display text-4xl sm:text-5xl text-gold-shine">{boutique.nom}</h1>
              <p className="text-navy-200/70 text-sm sm:text-base mt-3 font-sans leading-relaxed">{boutique.description}</p>
              <p className="font-sans text-xs tracking-wider uppercase text-navy-200/50 mt-3">
                {boutique.followers_count} followers · {produits.length} produits
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href={`https://wa.me/${boutique.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-emerald flex-1 py-3 rounded-full font-sans tracking-wide text-center text-sm"
            >
              Contacter sur WhatsApp
            </a>
            {!estProprietaire && (
              <button
                onClick={toggleSuivi}
                className={`px-7 py-3 rounded-full font-sans tracking-wide text-sm transition ${
                  suivi
                    ? 'bg-navy-800 border border-navy-600 text-navy-100/80 hover:bg-navy-700'
                    : 'btn-gold'
                }`}
              >
                {suivi ? 'Suivi' : '+ Suivre'}
              </button>
            )}
            {estProprietaire && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setPartageOuvert(true)}
                  className="btn-gold flex-1 px-5 py-3 rounded-full font-sans text-sm"
                >
                  📤 Partager
                </button>
                <button
                  onClick={() => navigate(`/ajouter-produit/${boutique.id}`)}
                  className="flex-1 px-5 py-3 rounded-full font-sans text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition"
                >
                  + Produit
                </button>
                <button
                  onClick={() => navigate('/creer-boutique')}
                  className="flex-1 px-5 py-3 rounded-full font-sans text-sm bg-navy-800 border border-navy-600 text-navy-100/80 hover:bg-navy-700 transition"
                >
                  Modifier
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-5 py-3 rounded-full font-sans text-sm bg-navy-800 border border-navy-600 text-navy-100/80 hover:bg-navy-700 transition"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="glass-navy border-b border-gold-500/10 sticky top-[73px] z-30">
        <div className="max-w-6xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('produits')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'produits' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            Produits ({produits.length})
          </button>
          <button
            onClick={() => setOnglet('avis')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'avis' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            Avis
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {onglet === 'produits' && (
          produits.length === 0 ? (
            <div className="text-center py-20 text-navy-200/60 font-display italic text-lg">
              Aucun produit pour l'instant
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {produits.map(produit => (
                <CarteProduit
                  key={produit.id}
                  produit={produit}
                  whatsapp={boutique.whatsapp}
                  estProprietaire={estProprietaire}
                  onSupprimer={supprimerProduit}
                  onModifier={(p) => navigate(`/modifier-produit/${p.id}`)}
                />
              ))}
            </div>
          )
        )}
        {onglet === 'avis' && <Avis boutiqueId={id} vendeurId={boutique.vendeur_id} />}
      </div>

      {partageOuvert && (
        <PartageBoutique boutique={boutique} onClose={() => setPartageOuvert(false)} />
      )}
    </div>
  )
}
