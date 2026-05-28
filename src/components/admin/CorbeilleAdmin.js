import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export default function CorbeilleAdmin() {
  const [corbeille, setCorbeille] = useState([])
  const [loading, setLoading] = useState(true)

  const charger = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('corbeille').select('*').order('supprime_at', { ascending: false })
    setCorbeille(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { charger() }, [charger])

  const restaurer = async (item) => {
    await supabase.from('profiles').insert({
      id: item.user_id, nom: item.nom, role: item.role, bloque: false
    })
    await supabase.from('corbeille').delete().eq('id', item.id)
    charger()
  }

  const supprimerDefinitivement = async (id) => {
    if (!window.confirm("Supprimer définitivement (irréversible) ?")) return
    await supabase.from('corbeille').delete().eq('id', id)
    charger()
  }

  if (loading) return (
    <p className="text-center py-12 text-navy-200/60 font-display italic">Chargement…</p>
  )

  if (corbeille.length === 0) return (
    <div className="text-center py-16 text-navy-200/60">
      <p className="text-4xl mb-2">🗑️</p>
      <p className="font-display italic">Corbeille vide</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-xs text-navy-200/60 font-sans">
        {corbeille.length} élément{corbeille.length > 1 ? 's' : ''} dans la corbeille
      </p>
      {corbeille.map(item => (
        <div key={item.id} className="bg-navy-800/50 rounded-2xl p-4 border border-red-500/20">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg text-navy-100">{item.nom}</p>
              <p className="text-xs text-navy-200/60 font-sans">{item.role}</p>
              {item.whatsapp && (
                <p className="text-xs text-navy-200/60 font-sans">WA: {item.whatsapp}</p>
              )}
              <p className="text-xs text-red-300 mt-1 font-sans">
                Supprimé le {new Date(item.supprime_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => restaurer(item)}
                className="text-xs px-4 py-1.5 rounded-full font-sans bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-500/30 transition"
              >
                Restaurer
              </button>
              <button
                onClick={() => supprimerDefinitivement(item.id)}
                className="text-xs px-4 py-1.5 rounded-full font-sans bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-500/30 transition"
              >
                Suppression définitive
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
