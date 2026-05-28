import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { extraireId } from '../../lib/extraireId'
import { creerNotification, TYPES_NOTIF } from '../../lib/notifications'

export default function UtilisateursAdmin() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('tous')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [idFiltre, setIdFiltre] = useState(null) // si recherche par UUID/lien

  const charger = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*, boutiques(id, nom, whatsapp, followers_count, produits(id))')
      .order('created_at', { ascending: false })
    setUtilisateurs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { charger() }, [charger])

  // Si la recherche contient un UUID/lien, on essaie de trouver l'utilisateur correspondant
  useEffect(() => {
    const id = extraireId(recherche)
    if (!id) { setIdFiltre(null); return }
    // Le UUID peut être un profil OU une boutique → on cherche dans les boutiques
    const userParBoutique = utilisateurs.find(u => u.boutiques?.some(b => b.id === id))
    if (userParBoutique) {
      setIdFiltre(userParBoutique.id)
    } else {
      // Sinon, essayer comme ID de profil direct
      setIdFiltre(id)
    }
  }, [recherche, utilisateurs])

  const bloquerUser = async (userId, bloque) => {
    await supabase.from('profiles')
      .update({ bloque: !bloque, bloque_at: !bloque ? new Date().toISOString() : null })
      .eq('id', userId)
    // Notifier l'utilisateur
    await creerNotification({
      user_id: userId,
      type: !bloque ? TYPES_NOTIF.ADMIN_BLOQUE : TYPES_NOTIF.ADMIN_DEBLOQUE,
      message: !bloque
        ? '🚫 Ton compte a été bloqué par l\'administration. Contacte le support pour plus d\'infos.'
        : '✅ Ton compte a été débloqué. Bon retour parmi nous !',
      lien: '/profil',
    })
    charger()
  }

  const supprimerUser = async (u) => {
    if (!window.confirm(`Supprimer définitivement "${u.nom}" (mise en corbeille) ?`)) return
    await supabase.from('corbeille').insert({
      user_id: u.id, nom: u.nom, email: '', role: u.role,
      whatsapp: u.boutiques?.[0]?.whatsapp || '', donnees: u
    })
    await supabase.from('profiles').delete().eq('id', u.id)
    charger()
  }

  const usersFiltres = utilisateurs.filter(u => {
    if (idFiltre) return u.id === idFiltre
    const recheLow = recherche.toLowerCase()
    const matchRecherche = !recherche ||
      u.nom?.toLowerCase().includes(recheLow) ||
      u.role?.toLowerCase().includes(recheLow) ||
      u.id?.toLowerCase().includes(recheLow)
    const matchRole = filtreRole === 'tous' || u.role === filtreRole
    const matchStatut = filtreStatut === 'tous'
      || (filtreStatut === 'bloque' && u.bloque)
      || (filtreStatut === 'actif' && !u.bloque)
      || (filtreStatut === 'avec_boutique' && u.boutiques?.length > 0)
      || (filtreStatut === 'sans_boutique' && (!u.boutiques || u.boutiques.length === 0))
    return matchRecherche && matchRole && matchStatut
  })

  if (loading) return (
    <p className="text-center py-12 text-navy-200/60 font-display italic">Chargement…</p>
  )

  return (
    <div className="space-y-4">
      {/* Search + filtres */}
      <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-4 space-y-3">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par nom, rôle, ID ou colle un lien de boutique…"
          className="input-dark w-full rounded-lg px-4 py-3 text-sm font-sans"
        />
        {idFiltre && (
          <p className="text-xs text-gold-300 font-sans">
            🔗 Recherche par lien : utilisateur trouvé
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'tous', label: 'Tous les rôles' },
            { id: 'acheteur', label: 'Acheteurs' },
            { id: 'vendeur', label: 'Vendeurs' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFiltreRole(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-sans transition ${
                filtreRole === opt.id ? 'bg-gold-shine text-navy-950' : 'bg-navy-900 text-navy-200/70 hover:bg-navy-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="text-navy-700">|</span>
          {[
            { id: 'tous', label: 'Tous' },
            { id: 'actif', label: 'Actifs' },
            { id: 'bloque', label: 'Bloqués' },
            { id: 'avec_boutique', label: 'Avec boutique' },
            { id: 'sans_boutique', label: 'Sans boutique' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFiltreStatut(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-sans transition ${
                filtreStatut === opt.id ? 'bg-gold-shine text-navy-950' : 'bg-navy-900 text-navy-200/70 hover:bg-navy-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-navy-200/60 font-sans">
          {usersFiltres.length} résultat{usersFiltres.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {usersFiltres.length === 0 ? (
          <p className="text-center py-12 text-navy-200/60 font-display italic">Aucun utilisateur trouvé</p>
        ) : usersFiltres.map(u => (
          <div
            key={u.id}
            className={`rounded-2xl p-4 border ${
              u.bloque ? 'bg-red-900/15 border-red-500/30' : 'bg-navy-800/50 border-navy-700'
            }`}
          >
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display text-lg text-navy-100">{u.nom}</p>
                  <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full font-sans ${
                    u.role === 'vendeur'
                      ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                      : 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {u.role}
                  </span>
                  {u.bloque && (
                    <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-red-900/30 text-red-300 border border-red-500/30 font-sans">
                      Bloqué
                    </span>
                  )}
                </div>
                <p className="text-[10px] tracking-wider text-navy-200/50 mt-1 font-mono break-all">
                  ID: {u.id}
                </p>
                <p className="text-xs text-navy-200/60 mt-0.5 font-sans">
                  Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </p>
                {u.boutiques && u.boutiques.length > 0 && (
                  <div className="mt-3 bg-navy-900 border border-navy-700 rounded-xl p-3">
                    <p className="font-display text-base text-gold-shine">{u.boutiques[0].nom}</p>
                    <p className="text-xs text-navy-200/60 mt-1 font-sans">
                      {u.boutiques[0].produits?.length || 0} produits ·
                      {u.boutiques[0].followers_count} followers ·
                      WA: {u.boutiques[0].whatsapp || 'Non renseigné'}
                    </p>
                    <p className="text-[10px] text-navy-200/40 mt-1 font-mono break-all">
                      Lien: /b/{u.boutiques[0].id}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => bloquerUser(u.id, u.bloque)}
                  className={`text-xs px-4 py-1.5 rounded-full font-sans transition whitespace-nowrap ${
                    u.bloque
                      ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-500/30'
                      : 'bg-gold-900/30 text-gold-300 hover:bg-gold-900/50 border border-gold-500/30'
                  }`}
                >
                  {u.bloque ? 'Débloquer' : 'Bloquer'}
                </button>
                <button
                  onClick={() => supprimerUser(u)}
                  className="text-xs px-4 py-1.5 rounded-full font-sans bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-500/30 transition whitespace-nowrap"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
