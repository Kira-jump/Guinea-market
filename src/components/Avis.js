import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Etoiles({ note, onClick, interactive = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onClick && onClick(i)}
          className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            i <= note ? 'text-gold-shine' : 'text-navy-600'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function Avis({ boutiqueId, vendeurId }) {
  const [avis, setAvis] = useState([])
  const [monAvis, setMonAvis] = useState(null)
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const { user, profile } = useAuth()

  const fetchAvis = useCallback(async () => {
    const { data } = await supabase
      .from('avis')
      .select('*, profiles(nom)')
      .eq('boutique_id', boutiqueId)
      .order('created_at', { ascending: false })
    setAvis(data || [])

    if (user) {
      const monAvisData = data?.find(a => a.acheteur_id === user.id)
      if (monAvisData) {
        setMonAvis(monAvisData)
        setNote(monAvisData.note)
        setCommentaire(monAvisData.commentaire || '')
      }
    }
  }, [boutiqueId, user])

  useEffect(() => {
    fetchAvis()
  }, [fetchAvis])

  const moyenneNote = avis.length > 0
    ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (note === 0) return
    setLoading(true)

    if (monAvis) {
      await supabase.from('avis').update({ note, commentaire }).eq('id', monAvis.id)
    } else {
      await supabase.from('avis').insert({
        boutique_id: boutiqueId,
        acheteur_id: user.id,
        note,
        commentaire
      })

      if (vendeurId && vendeurId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: vendeurId,
          type: 'avis',
          message: `⭐ Tu as reçu un nouvel avis ${note}/5 ${commentaire ? `- "${commentaire.substring(0, 50)}..."` : ''}`,
          lien: `/boutique/${boutiqueId}`
        })
      }
    }

    await fetchAvis()
    setAfficherFormulaire(false)
    setLoading(false)
  }

  const handleSupprimer = async () => {
    if (!monAvis) return
    await supabase.from('avis').delete().eq('id', monAvis.id)
    setMonAvis(null)
    setNote(0)
    setCommentaire('')
    await fetchAvis()
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-6 border-b border-navy-700 pb-4">
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">Témoignages</p>
          <h2 className="font-display text-2xl sm:text-3xl text-navy-100">Avis ({avis.length})</h2>
        </div>
        {avis.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl text-gold-shine font-semibold">{moyenneNote}</span>
            <div>
              <Etoiles note={Math.round(moyenneNote)} />
              <p className="text-xs text-navy-200/60 mt-1 font-sans">{avis.length} avis</p>
            </div>
          </div>
        )}
      </div>

      {user && profile?.role === 'acheteur' && (
        <div className="mb-6">
          {!afficherFormulaire ? (
            <button
              onClick={() => setAfficherFormulaire(true)}
              className="w-full border-2 border-dashed border-gold-500/30 text-gold-300 py-4 rounded-2xl text-sm font-sans hover:bg-gold-500/5 transition"
            >
              {monAvis ? '✏️ Modifier mon avis' : '⭐ Laisser un avis'}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-navy-800/60 border border-gold-500/20 rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-sm font-sans text-navy-100 mb-2">Ta note</p>
                <Etoiles note={note} onClick={setNote} interactive={true} />
              </div>
              <div>
                <p className="text-sm font-sans text-navy-100 mb-1">Commentaire</p>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Partage ton expérience…"
                  rows={3}
                  className="input-dark w-full rounded-lg px-3 py-2 text-sm font-sans"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || note === 0}
                  className="btn-emerald flex-1 py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Envoi…' : monAvis ? 'Mettre à jour' : 'Publier'}
                </button>
                <button
                  type="button"
                  onClick={() => setAfficherFormulaire(false)}
                  className="px-4 py-2.5 bg-navy-700 text-navy-100 rounded-lg text-sm hover:bg-navy-600 transition font-sans"
                >
                  Annuler
                </button>
                {monAvis && (
                  <button
                    type="button"
                    onClick={handleSupprimer}
                    className="px-4 py-2.5 bg-red-900/40 text-red-300 rounded-lg text-sm hover:bg-red-900/60 transition border border-red-500/30"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {avis.length === 0 ? (
        <div className="text-center py-12 text-navy-200/50">
          <p className="text-3xl mb-2">⭐</p>
          <p className="font-display italic">Aucun avis pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avis.map(a => (
            <div key={a.id} className="bg-navy-800/50 border border-navy-700 rounded-2xl p-4 hover:border-gold-500/20 transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-sans text-navy-100 text-sm">
                    👤 {a.profiles?.nom || 'Anonyme'}
                    {a.acheteur_id === user?.id && (
                      <span className="ml-2 text-[10px] tracking-wider uppercase text-gold-400">(moi)</span>
                    )}
                  </p>
                  <Etoiles note={a.note} />
                </div>
                <span className="text-xs text-navy-200/50 font-sans">
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {a.commentaire && (
                <p className="text-navy-200/80 text-sm mt-2 font-sans leading-relaxed">{a.commentaire}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
