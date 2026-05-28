import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ApercuAdmin() {
  const [stats, setStats] = useState({
    users: 0, acheteurs: 0, vendeurs: 0, bloques: 0,
    boutiques: 0, produits: 0, vues: 0, follows: 0, avis: 0,
    epinglees: 0, epingles: 0,
  })
  const [topBoutiques, setTopBoutiques] = useState([])
  const [signupsParJour, setSignupsParJour] = useState([])
  const [activiteRecente, setActiviteRecente] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const charger = async () => {
      try {
        const [
          { data: users },
          { count: boutiquesCount },
          { count: produitsCount },
          { count: vuesCount },
          { count: followsCount },
          { count: avisCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('boutiques').select('*', { count: 'exact', head: true }),
          supabase.from('produits').select('*', { count: 'exact', head: true }),
          supabase.from('vues').select('*', { count: 'exact', head: true }),
          supabase.from('follows').select('*', { count: 'exact', head: true }),
          supabase.from('avis').select('*', { count: 'exact', head: true }),
        ])

        if (!mounted) return
        const allUsers = users || []
        const epingleesCount = await supabase.from('boutiques').select('*', { count: 'exact', head: true }).eq('epinglee', true).then(r => r.count || 0).catch(() => 0)
        const epinglesCount = await supabase.from('produits').select('*', { count: 'exact', head: true }).eq('epingle', true).then(r => r.count || 0).catch(() => 0)

        setStats({
          users: allUsers.length,
          acheteurs: allUsers.filter(u => u.role === 'acheteur').length,
          vendeurs: allUsers.filter(u => u.role === 'vendeur').length,
          bloques: allUsers.filter(u => u.bloque).length,
          boutiques: boutiquesCount || 0,
          produits: produitsCount || 0,
          vues: vuesCount || 0,
          follows: followsCount || 0,
          avis: avisCount || 0,
          epinglees: epingleesCount,
          epingles: epinglesCount,
        })

        // Top 5 boutiques par followers
        const { data: topBts } = await supabase
          .from('boutiques')
          .select('id, nom, logo_url, followers_count, vendeur_id, profiles(nom)')
          .order('followers_count', { ascending: false })
          .limit(5)
        if (mounted) setTopBoutiques(topBts || [])

        // Signups 7 derniers jours
        const jours = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const label = date.toLocaleDateString('fr-FR', { weekday: 'short' })
          const count = allUsers.filter(u => u.created_at?.startsWith(dateStr)).length
          jours.push({ label, count, dateStr })
        }
        if (mounted) setSignupsParJour(jours)

        // Activité récente : 10 derniers users + 5 dernières boutiques + 5 derniers produits
        const recents = []
        allUsers.slice(0, 10).forEach(u => recents.push({
          type: 'user', label: `${u.nom} a rejoint`, sub: u.role,
          date: u.created_at, icon: '👤'
        }))
        const { data: recentBts } = await supabase.from('boutiques')
          .select('nom, created_at').order('created_at', { ascending: false }).limit(5)
        ;(recentBts || []).forEach(b => recents.push({
          type: 'boutique', label: `Boutique "${b.nom}" créée`, sub: '',
          date: b.created_at, icon: '🏪'
        }))
        const { data: recentPrds } = await supabase.from('produits')
          .select('nom, created_at, boutiques(nom)').order('created_at', { ascending: false }).limit(5)
        ;(recentPrds || []).forEach(p => recents.push({
          type: 'produit', label: `Produit "${p.nom}"`, sub: p.boutiques?.nom || '',
          date: p.created_at, icon: '📦'
        }))
        recents.sort((a, b) => new Date(b.date) - new Date(a.date))
        if (mounted) setActiviteRecente(recents.slice(0, 12))
      } catch (e) {
        console.error('Apercu admin load:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    charger()
    return () => { mounted = false }
  }, [])

  const Card = ({ label, value, accent, sub }) => (
    <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-4 hover:border-gold-500/30 transition">
      <p className={`font-display text-3xl font-semibold ${accent || 'text-gold-shine'}`}>{value}</p>
      <p className="text-[10px] tracking-widest uppercase text-navy-200/60 mt-1 font-sans">{label}</p>
      {sub && <p className="text-[10px] text-navy-200/40 mt-0.5 font-sans">{sub}</p>}
    </div>
  )

  if (loading) return (
    <p className="text-center py-12 text-navy-200/60 font-display italic">Chargement des stats…</p>
  )

  const maxSignups = Math.max(...signupsParJour.map(j => j.count), 1)

  return (
    <div className="space-y-5">
      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card label="Utilisateurs" value={stats.users} />
        <Card label="Acheteurs" value={stats.acheteurs} accent="text-emerald-400" />
        <Card label="Vendeurs" value={stats.vendeurs} accent="text-gold-400" />
        <Card label="Bloqués" value={stats.bloques} accent="text-red-400" />
        <Card label="Boutiques" value={stats.boutiques} />
        <Card label="Produits" value={stats.produits} />
        <Card label="Vues totales" value={stats.vues} />
        <Card label="Follows" value={stats.follows} />
        <Card label="Avis postés" value={stats.avis} />
        <Card label="Boutiques à la une" value={stats.epinglees} accent="text-gold-400" />
        <Card label="Produits à la une" value={stats.epingles} accent="text-gold-400" />
      </div>

      {/* Graphique signups */}
      <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-5">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">Tendance</p>
        <h2 className="font-display text-2xl text-navy-100 mb-5">Inscriptions sur 7 jours</h2>
        <div className="flex items-end gap-3 h-32">
          {signupsParJour.map((j, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs text-navy-100 font-sans">{j.count}</span>
              <div
                className="w-full rounded-t-lg transition-all bg-gold-shine"
                style={{
                  height: `${j.count === 0 ? 4 : (j.count / maxSignups) * 100}px`,
                  opacity: j.count === 0 ? 0.2 : 1
                }}
              />
              <span className="text-[10px] tracking-wider uppercase text-navy-200/60 font-sans">{j.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top boutiques + Activité récente */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-5">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">Classement</p>
          <h2 className="font-display text-2xl text-navy-100 mb-4">Top 5 boutiques</h2>
          {topBoutiques.length === 0 ? (
            <p className="text-navy-200/60 text-sm font-display italic">Aucune boutique</p>
          ) : (
            <div className="space-y-2">
              {topBoutiques.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-navy-900 transition">
                  <span className="font-display text-xl text-gold-shine w-6 text-center font-semibold">{i + 1}</span>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-navy-900 border border-gold-500/30 flex-shrink-0">
                    {b.logo_url ? (
                      <img src={b.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-navy-100 truncate">{b.nom}</p>
                    <p className="text-xs text-navy-200/50 truncate font-sans">par {b.profiles?.nom || '—'}</p>
                  </div>
                  <span className="text-xs text-gold-300 font-sans whitespace-nowrap">{b.followers_count} ❤️</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-5">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">Live</p>
          <h2 className="font-display text-2xl text-navy-100 mb-4">Activité récente</h2>
          {activiteRecente.length === 0 ? (
            <p className="text-navy-200/60 text-sm font-display italic">Aucune activité</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activiteRecente.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-navy-700 last:border-0">
                  <span className="text-lg flex-shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-100 truncate font-sans">{a.label}</p>
                    {a.sub && <p className="text-[10px] tracking-wider uppercase text-navy-200/50 font-sans">{a.sub}</p>}
                  </div>
                  <span className="text-[10px] text-navy-200/50 font-sans whitespace-nowrap">
                    {new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
