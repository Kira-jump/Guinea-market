import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CarteBoutique({ boutique, userId }) {
  const [suivi, setSuivi] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const navigate = useNavigate()

  const fetchFollowers = useCallback(async () => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('boutique_id', boutique.id)
    setFollowersCount(count || 0)
  }, [boutique.id])

  const verifierSuivi = useCallback(async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('acheteur_id', userId)
      .eq('boutique_id', boutique.id)
      .maybeSingle()
    setSuivi(!!data)
  }, [userId, boutique.id])

  useEffect(() => {
    fetchFollowers()
    if (userId) verifierSuivi()
  }, [userId, fetchFollowers, verifierSuivi])

  const toggleSuivi = async (e) => {
    e.stopPropagation()
    if (!userId) { navigate('/connexion'); return }

    if (suivi) {
      await supabase.from('follows')
        .delete()
        .eq('acheteur_id', userId)
        .eq('boutique_id', boutique.id)
      setSuivi(false)
      setFollowersCount(prev => prev - 1)
    } else {
      await supabase.from('follows')
        .insert({ acheteur_id: userId, boutique_id: boutique.id })
      setSuivi(true)
      setFollowersCount(prev => prev + 1)
    }
  }

  return (
    <div
      onClick={() => navigate(`/boutique/${boutique.id}`)}
      className="group bg-navy-800/50 rounded-2xl border border-navy-700 hover:border-gold-500/40 hover:shadow-card-dark transition-all cursor-pointer overflow-hidden duration-300"
    >
      <div className="h-40 sm:h-44 bg-navy-900 overflow-hidden relative">
        {boutique.logo_url ? (
          <img src={boutique.logo_url} alt={boutique.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy-600 text-4xl">🏪</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-display text-xl text-navy-100">{boutique.nom}</h3>
        <p className="font-sans text-navy-200/60 text-xs mt-1 line-clamp-2 leading-relaxed">{boutique.description}</p>

        <div className="flex justify-between items-center mt-4">
          <span className="font-sans text-[11px] tracking-wider uppercase text-navy-200/50">
            {followersCount} follower{followersCount > 1 ? 's' : ''}
          </span>
          <button
            onClick={toggleSuivi}
            className={`text-xs px-4 py-1.5 rounded-full font-sans tracking-wide transition ${
              suivi
                ? 'bg-navy-700 text-navy-100/80 hover:bg-navy-600 border border-navy-600'
                : 'btn-gold'
            }`}
          >
            {suivi ? 'Suivi' : '+ Suivre'}
          </button>
        </div>
      </div>
    </div>
  )
}
