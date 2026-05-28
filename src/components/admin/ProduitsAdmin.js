import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { extraireId } from '../../lib/extraireId'
import { CATEGORIES } from '../../lib/categories'

export default function ProduitsAdmin() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('tout')
  const [filtreEpingle, setFiltreEpingle] = useState('tous')

  const charger = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('produits')
      .select('*, boutiques(id, nom)')
      .order('created_at', { ascending: false })
    setProduits(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { charger() }, [charger])

  const toggleEpingle = async (p) => {
    const nouveau = !p.epingle
    try {
      const { error } = await supabase.from('produits')
        .update({ epingle: nouveau, epingle_position: nouveau ? Date.now() : 0 })
        .eq('id', p.id)
      if (error) throw error
      charger()
    } catch (e) {
      alert("Impossible d'épingler — vérifie que la colonne 'epingle' existe en base.")
    }
  }

  const changerPosition = async (p, position) => {
    try {
      await supabase.from('produits')
        .update({ epingle_position: parseInt(position, 10) || 0 })
        .eq('id', p.id)
      charger()
    } catch (e) { /* silencieux */ }
  }

  const supprimer = async (p) => {
    if (!window.confirm(`Supprimer définitivement "${p.nom}" ?`)) return
    await supabase.from('produits').delete().eq('id', p.id)
    charger()
  }

  const idFiltre = extraireId(recherche)
  const produitsFiltres = produits.filter(p => {
    if (idFiltre) return p.id === idFiltre || p.boutique_id === idFiltre
    const recheLow = recherche.toLowerCase()
    const matchRecherche = !recherche ||
      p.nom?.toLowerCase().includes(recheLow) ||
      p.boutiques?.nom?.toLowerCase().includes(recheLow)
    const matchCat = filtreCategorie === 'tout' || p.categorie === filtreCategorie
    const matchEpingle = filtreEpingle === 'tous' || (filtreEpingle === 'epingles' && p.epingle)
    return matchRecherche && matchCat && matchEpingle
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
          placeholder="Rechercher par nom, boutique, ID ou colle un lien…"
          className="input-dark w-full rounded-lg px-4 py-3 text-sm font-sans"
        />
        {idFiltre && (
          <p className="text-xs text-gold-300 font-sans">🔗 Recherche par lien</p>
        )}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFiltreCategorie(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-sans transition ${
                filtreCategorie === cat.id ? 'bg-gold-shine text-navy-950' : 'bg-navy-900 text-navy-200/70 hover:bg-navy-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { id: 'tous', label: 'Tous' },
            { id: 'epingles', label: '⭐ Épinglés' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFiltreEpingle(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-sans transition ${
                filtreEpingle === opt.id ? 'bg-gold-shine text-navy-950' : 'bg-navy-900 text-navy-200/70 hover:bg-navy-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-navy-200/60 font-sans">
          {produitsFiltres.length} produit{produitsFiltres.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {produitsFiltres.length === 0 ? (
          <p className="text-center py-12 text-navy-200/60 font-display italic sm:col-span-2">Aucun produit</p>
        ) : produitsFiltres.map(p => (
          <div
            key={p.id}
            className={`rounded-2xl p-4 border ${
              p.epingle ? 'bg-gold-900/15 border-gold-500/40' : 'bg-navy-800/50 border-navy-700'
            }`}
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-navy-900 overflow-hidden flex-shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                ) : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base text-navy-100 truncate">{p.nom}</p>
                <p className="text-xs text-navy-200/60 font-sans truncate">de {p.boutiques?.nom || '—'}</p>
                <p className="text-gold-shine font-display font-semibold mt-1">
                  {p.prix?.toLocaleString()} GNF
                </p>
                {p.categorie && (
                  <span className="inline-block mt-1 text-[10px] tracking-wider uppercase text-navy-200/60 font-sans">
                    {p.categorie}
                  </span>
                )}
                {p.epingle && (
                  <span className="block mt-1 text-[10px] tracking-widest uppercase text-gold-300 font-sans">
                    ⭐ À la une
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => toggleEpingle(p)}
                className={`flex-1 text-xs px-3 py-1.5 rounded-full font-sans transition whitespace-nowrap ${
                  p.epingle ? 'bg-gold-shine text-navy-950' : 'bg-navy-900 text-gold-300 border border-gold-500/30 hover:bg-navy-700'
                }`}
              >
                {p.epingle ? '⭐ Épinglé' : 'Épingler'}
              </button>
              {p.epingle && (
                <input
                  type="number"
                  defaultValue={p.epingle_position || 0}
                  onBlur={(e) => changerPosition(p, e.target.value)}
                  className="input-dark w-16 rounded-lg px-2 py-1 text-xs font-sans text-center"
                  title="Position (plus grand = plus haut)"
                />
              )}
              <button
                onClick={() => supprimer(p)}
                className="text-xs px-3 py-1.5 rounded-full font-sans bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-500/30 transition"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
