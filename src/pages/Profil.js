import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CarteBoutique from '../components/CarteBoutique'

export default function Profil() {
  const [boutiquesFollowees, setBoutiquesFollowees] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('infos')
  const { user, profile, boutique: maBoutique } = useAuth()
  const navigate = useNavigate()
  const hasBoutique = !!maBoutique

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const { data: follows } = await supabase
        .from('followers').select('boutique_id').eq('user_id', user.id)

      if (follows && follows.length > 0) {
        const ids = follows.map(f => f.boutique_id)
        const { data } = await supabase.from('boutiques').select('*').in('id', ids)
        setBoutiquesFollowees(data || [])
      }
    } catch (e) {
      console.error('Profil fetchData error:', e)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    fetchData()
  }, [user, navigate, fetchData])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Chargement…
    </div>
  )

  const photoProfile = maBoutique?.logo_url || null

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header profil */}
      <div className="relative overflow-hidden border-b border-gold-500/15">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 py-10 text-center">
          <div className="w-24 h-24 rounded-full bg-navy-800 flex items-center justify-center mx-auto mb-4 border-2 border-gold-500/50 shadow-gold-glow overflow-hidden">
            {photoProfile ? (
              <img src={photoProfile} alt={profile?.nom} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gold-shine font-display text-3xl font-bold">
                {profile?.nom?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-navy-100">{profile?.nom}</h1>
          <p className="text-navy-200/70 text-sm mt-1 font-sans">{user?.email}</p>
          {hasBoutique && (
            <div className="mt-3">
              <span className="font-sans text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-gold-500/40 text-gold-300 bg-gold-900/30">Vendeur</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="glass-navy border-b border-gold-500/10">
        <div className="max-w-3xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-2xl text-gold-shine font-semibold">{boutiquesFollowees.length}</p>
            <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mt-1 font-sans">Suivies</p>
          </div>
          <div>
            <p className="font-display text-2xl text-gold-shine font-semibold">
              {hasBoutique ? (maBoutique?.followers_count || 0) : '-'}
            </p>
            <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mt-1 font-sans">Followers</p>
          </div>
          <div>
            <p className="font-display text-base text-gold-shine font-semibold">
              {new Date(user?.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mt-1 font-sans">Depuis</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="glass-navy border-b border-gold-500/10 sticky top-[73px] z-30">
        <div className="max-w-3xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('infos')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'infos' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            Infos
          </button>
          <button
            onClick={() => setOnglet('suivis')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'suivis' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            Suivies
          </button>
          <button
            onClick={() => setOnglet('boutique')}
            className={`flex-1 py-4 text-sm font-sans tracking-wider uppercase border-b-2 transition-all ${
              onglet === 'boutique' ? 'border-gold-500 text-gold-300' : 'border-transparent text-navy-200/60 hover:text-navy-100'
            }`}
          >
            Ma boutique
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Infos */}
        {onglet === 'infos' && (
          <div className="glass-navy border border-gold-500/15 rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mb-1 font-sans">Nom complet</p>
              <p className="font-display text-xl text-navy-100">{profile?.nom}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mb-1 font-sans">Email</p>
              <p className="font-sans text-navy-100">{user?.email}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mb-1 font-sans">Membre depuis</p>
              <p className="font-sans text-navy-100">
                {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>

            {hasBoutique ? (
              <button
                onClick={() => navigate(`/boutique/${maBoutique.id}`)}
                className="btn-gold w-full py-3 rounded-full text-sm tracking-wide"
              >
                Voir ma boutique
              </button>
            ) : (
              <button
                onClick={() => navigate('/creer-boutique')}
                className="btn-emerald w-full py-3 rounded-full text-sm tracking-wide"
              >
                🏪 Créer ma boutique
              </button>
            )}
          </div>
        )}

        {/* Boutiques suivies */}
        {onglet === 'suivis' && (
          boutiquesFollowees.length === 0 ? (
            <div className="text-center py-20 text-navy-200/60">
              <p className="font-display text-xl italic mb-3">Tu ne suis aucune boutique</p>
              <button onClick={() => navigate('/')} className="btn-gold px-7 py-3 rounded-full text-sm">
                Découvrir des boutiques
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {boutiquesFollowees.map(boutique => (
                <CarteBoutique key={boutique.id} boutique={boutique} userId={user?.id} />
              ))}
            </div>
          )
        )}

        {/* Ma boutique */}
        {onglet === 'boutique' && (
          hasBoutique ? (
            <div className="max-w-sm mx-auto">
              <CarteBoutique boutique={maBoutique} userId={user?.id} />
            </div>
          ) : (
            <div className="text-center py-20 text-navy-200/60">
              <p className="font-display text-xl italic mb-3">Tu n'as pas encore de boutique</p>
              <button onClick={() => navigate('/creer-boutique')} className="btn-gold px-7 py-3 rounded-full text-sm">
                🏪 Créer ma boutique
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
