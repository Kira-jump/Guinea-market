import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { extraireId } from '../../lib/extraireId'
import { creerNotification, TYPES_NOTIF } from '../../lib/notifications'

export default function BoutiquesAdmin() {
  const [boutiques, setBoutiques] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('toutes')

  const charger = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('boutiques')
      .select('*, profiles(nom)')
      .order('created_at', { ascending: false })
    setBoutiques(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { charger() }, [charger])

  const toggleEpingle = async (b) => {
    const nouveau = !b.epinglee
    try {
      const { error } = await supabase.from('boutiques')
        .update({ epinglee: nouveau, epinglee_position: nouveau ? Date.now() : 0 })
        .eq('id', b.id)
      if (error) throw error
      // Notifier le vendeur
      if (b.vendeur_id) {
        await creerNotification({
          user_id: b.vendeur_id,
          type: TYPES_NOTIF.ADMIN_EPINGLE,
          message: nouveau
            ? `✨ Ta boutique "${b.nom}" est maintenant à la une de ShopGN !`
            : `Ta boutique "${b.nom}" n'est plus à la une.`,
          lien: `/boutique/${b.id}`,
        })
      }
      charger()
    } catch (e) {
      alert("Impossible d'épingler — vérifie que la colonne 'epinglee' existe en base (voir le SQL admin-features).")
    }
  }

  const changerPosition = async (b, position) => {
    try {
      await supabase.from('boutiques')
        .update({ epinglee_position: parseInt(position, 10) || 0 })
        .eq('id', b.id)
      charger()
    } catch (e) { /* silencieux */ }
  }

  const toggleBloque = async (b) => {
    try {
      const { error } = await supabase.from('boutiques')
        .update({ bloquee: !b.bloquee })
        .eq('id', b.id)
      if (error) throw error
      charger()
    } catch (e) {
      alert("Colonne 'bloquee' manquante — ajoute-la via le SQL admin-features.")
    }
  }

  const supprimer = async (b) => {
    if (!window.confirm(`Supprimer définitivement la boutique "${b.nom}" ? Tous ses produits seront supprimés.`)) return
    await supabase.from('produits').delete().eq('boutique_id', b.id)
    await supabase.from('boutiques').delete().eq('id', b.id)
    charger()
  }

  const idFiltre = extraireId(recherche)
  const boutiquesFiltrees = boutiques.filter(b => {
    if (idFiltre) return b.id === idFiltre
    const recheLow = recherche.toLowerCase()
    const matchRecherche = !recherche ||
      b.nom?.toLowerCase().includes(recheLow) ||
      b.profiles?.nom?.toLowerCase().includes(recheLow)
    const matchFiltre = filtre === 'toutes'
      || (filtre === 'epinglees' && b.epinglee)
      || (filtre === 'bloquees' && b.bloquee)
    return matchRecherche && matchFiltre
  })

  if (loading) return (
    <p className="text-center py-12 text-navy-200/60 font-display italic">Chargement…</p>
  )

  return (
    <div className="space-y-4">
      <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-4 space-y-3">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par nom, vendeur, ID ou colle un lien…"
          className="input-dark w-full rounded-lg px-4 py-3 text-sm font-sans"
        />
        {idFiltre && (
          <p className="text-xs text-gold-300 font-sans">🔗 Recherche par lien</p>
        )}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'toutes', label: 'Toutes' },
            { id: 'epinglees', label: '⭐ Épinglées' },
            { id: 'bloquees', label: '🚫 Bloquées' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFiltre(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-sans transition ${
                filtre === opt.id ? 'bg-gold-shine text-navy-950' : 'bg-navy-900 text-navy-200/70 hover:bg-navy-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-navy-200/60 font-sans">
          {boutiquesFiltrees.length} boutique{boutiquesFiltrees.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {boutiquesFiltrees.length === 0 ? (
          <p className="text-center py-12 text-navy-200/60 font-display italic">Aucune boutique</p>
        ) : boutiquesFiltrees.map(b => (
          <div
            key={b.id}
            className={`rounded-2xl p-4 border ${
              b.bloquee ? 'bg-red-900/15 border-red-500/30'
              : b.epinglee ? 'bg-gold-900/15 border-gold-500/40'
              : 'bg-navy-800/50 border-navy-700'
            }`}
          >
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-navy-900 border border-gold-500/30 overflow-hidden flex-shrink-0">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-lg text-navy-100">{b.nom}</p>
                    {b.epinglee && (
                      <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-300 border border-gold-500/30 font-sans">
                        ⭐ À la une
                      </span>
                    )}
                    {b.bloquee && (
                      <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-red-900/30 text-red-300 border border-red-500/30 font-sans">
                        Bloquée
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy-200/60 mt-0.5 font-sans">par {b.profiles?.nom || '—'}</p>
                  <p className="text-xs text-navy-200/50 mt-0.5 font-sans">
                    {b.followers_count} followers · WA {b.whatsapp || '—'}
                  </p>
                  <p className="text-[10px] text-navy-200/40 mt-1 font-mono break-all">/b/{b.id}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleEpingle(b)}
                  className={`text-xs px-4 py-1.5 rounded-full font-sans transition whitespace-nowrap ${
                    b.epinglee
                      ? 'bg-gold-shine text-navy-950'
                      : 'bg-navy-900 text-gold-300 border border-gold-500/30 hover:bg-navy-700'
                  }`}
                >
                  {b.epinglee ? '⭐ Épinglée' : 'Épingler'}
                </button>
                {b.epinglee && (
                  <input
                    type="number"
                    defaultValue={b.epinglee_position || 0}
                    onBlur={(e) => changerPosition(b, e.target.value)}
                    placeholder="Pos."
                    className="input-dark w-20 rounded-lg px-2 py-1 text-xs font-sans text-center"
                    title="Position (plus grand = plus haut)"
                  />
                )}
                <button
                  onClick={() => toggleBloque(b)}
                  className={`text-xs px-4 py-1.5 rounded-full font-sans transition whitespace-nowrap ${
                    b.bloquee
                      ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                      : 'bg-navy-900 text-navy-200/70 border border-navy-600 hover:bg-navy-700'
                  }`}
                >
                  {b.bloquee ? 'Débloquer' : 'Bloquer'}
                </button>
                <button
                  onClick={() => supprimer(b)}
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
