import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import PartageBoutique from '../components/PartageBoutique'

export default function Dashboard() {
  const [boutique, setBoutique] = useState(null)
  const [stats, setStats] = useState({
    vues: 0, vuesAujourdhui: 0, vueSemaine: 0,
    followers: 0, produits: 0, avis: 0, moyenneNote: 0
  })
  const [vuesParJour, setVuesParJour] = useState([])
  const [loading, setLoading] = useState(true)
  const [partageOuvert, setPartageOuvert] = useState(false)
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    const { data: boutiqueData } = await supabase
      .from('boutiques').select('*').eq('vendeur_id', user.id).maybeSingle()

    if (!boutiqueData) { setLoading(false); return }
    setBoutique(boutiqueData)

    const { data: vuesData } = await supabase
      .from('vues').select('created_at').eq('boutique_id', boutiqueData.id)

    const aujourd = new Date().toISOString().split('T')[0]
    const semaine = new Date()
    semaine.setDate(semaine.getDate() - 7)

    const vuesAujourdhui = vuesData?.filter(v => v.created_at.startsWith(aujourd)).length || 0
    const vueSemaine = vuesData?.filter(v => new Date(v.created_at) >= semaine).length || 0

    const joursData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const label = date.toLocaleDateString('fr-FR', { weekday: 'short' })
      const count = vuesData?.filter(v => v.created_at.startsWith(dateStr)).length || 0
      joursData.push({ label, count })
    }
    setVuesParJour(joursData)

    const { count: followersCount } = await supabase
      .from('follows').select('*', { count: 'exact', head: true })
      .eq('boutique_id', boutiqueData.id)

    const { count: produitsCount } = await supabase
      .from('produits').select('*', { count: 'exact', head: true })
      .eq('boutique_id', boutiqueData.id)

    const { data: avisData } = await supabase
      .from('avis').select('note').eq('boutique_id', boutiqueData.id)

    const moyenneNote = avisData?.length > 0
      ? (avisData.reduce((acc, a) => acc + a.note, 0) / avisData.length).toFixed(1) : 0

    setStats({
      vues: vuesData?.length || 0,
      vuesAujourdhui, vueSemaine,
      followers: followersCount || 0,
      produits: produitsCount || 0,
      avis: avisData?.length || 0,
      moyenneNote
    })

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    if (profile && profile.role !== 'vendeur') { navigate('/'); return }
    if (profile) fetchData()
  }, [user, profile, navigate, fetchData])

  const maxVues = Math.max(...vuesParJour.map(v => v.count), 1)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Chargement…
    </div>
  )

  if (!boutique) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-2xl italic text-navy-200/70 mb-4">Tu n'as pas encore de boutique</p>
        <button onClick={() => navigate('/creer-boutique')} className="btn-gold px-7 py-3 rounded-full text-sm">
          Créer ma boutique
        </button>
      </div>
    </div>
  )

  const StatCard = ({ label, value, accent }) => (
    <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-4 hover:border-gold-500/30 transition">
      <p className={`font-display text-3xl ${accent || 'text-gold-shine'} font-semibold`}>{value}</p>
      <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mt-1 font-sans">{label}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="relative overflow-hidden border-b border-gold-500/15">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-10">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2">
            · Tableau de bord ·
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-gold-shine">Dashboard</h1>
          <p className="text-navy-200/70 text-sm mt-1 font-display italic">{boutique.nom}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Carte Partage en évidence */}
        <button
          onClick={() => setPartageOuvert(true)}
          className="relative w-full overflow-hidden rounded-3xl border border-gold-500/40 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-6 sm:p-7 text-left hover:border-gold-500/70 hover:shadow-gold-glow transition-all group"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gold-shine items-center justify-center text-2xl flex-shrink-0 shadow-gold-glow">
              📤
            </div>
            <div className="flex-1">
              <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-1">
                · Visibilité ·
              </p>
              <h2 className="font-display text-2xl sm:text-3xl text-gold-shine mb-1">
                Partage ta boutique
              </h2>
              <p className="font-sans text-navy-200/70 text-sm leading-relaxed">
                Lien unique, QR code, WhatsApp, réseaux sociaux — tout est prêt pour te faire connaître.
              </p>
            </div>
            <div className="hidden sm:block font-display text-3xl text-gold-300 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Vues totales" value={stats.vues} />
          <StatCard label="Aujourd'hui" value={stats.vuesAujourdhui} />
          <StatCard label="7 derniers jours" value={stats.vueSemaine} />
          <StatCard label="Followers" value={stats.followers} />
          <StatCard label="Produits" value={stats.produits} />
          <StatCard
            label={`${stats.avis} avis`}
            value={stats.moyenneNote > 0 ? `${stats.moyenneNote}★` : '-'}
          />
        </div>

        {/* Graphique */}
        <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-5">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">Tendance</p>
          <h2 className="font-display text-2xl text-navy-100 mb-5">Vues des 7 derniers jours</h2>
          <div className="flex items-end gap-3 h-36">
            {vuesParJour.map((jour, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-navy-100 font-sans">{jour.count}</span>
                <div
                  className="w-full rounded-t-lg transition-all bg-gold-shine"
                  style={{
                    height: `${jour.count === 0 ? 4 : (jour.count / maxVues) * 110}px`,
                    opacity: jour.count === 0 ? 0.2 : 1
                  }}
                />
                <span className="text-[10px] tracking-wider uppercase text-navy-200/60 font-sans">{jour.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-5">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">Raccourcis</p>
          <h2 className="font-display text-2xl text-navy-100 mb-5">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/ajouter-produit/${boutique.id}`)}
              className="btn-gold py-3 rounded-full text-sm tracking-wide"
            >
              + Ajouter un produit
            </button>
            <button
              onClick={() => navigate(`/boutique/${boutique.id}`)}
              className="btn-emerald py-3 rounded-full text-sm tracking-wide"
            >
              Voir ma boutique
            </button>
            <button
              onClick={() => setPartageOuvert(true)}
              className="bg-navy-800 border border-gold-500/30 text-gold-300 py-3 rounded-full font-sans hover:bg-navy-700 hover:border-gold-500/50 transition text-sm"
            >
              📤 Partager
            </button>
            <button
              onClick={() => navigate('/creer-boutique')}
              className="bg-navy-800 border border-navy-600 text-navy-100/80 py-3 rounded-full font-sans hover:bg-navy-700 transition text-sm"
            >
              Modifier boutique
            </button>
          </div>
        </div>
      </div>

      {partageOuvert && (
        <PartageBoutique boutique={boutique} onClose={() => setPartageOuvert(false)} />
      )}
    </div>
  )
}
