import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ICONES_NOTIF, demanderPermissionPush, permissionPushDisponible } from '../lib/notifications'

const FILTRES = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'non_lues', label: 'Non lues' },
  { id: 'follow', label: '👥 Suivis' },
  { id: 'avis', label: '⭐ Avis' },
  { id: 'produit', label: '📦 Produits' },
  { id: 'admin', label: '🛡️ Admin' },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('toutes')
  const [permPush, setPermPush] = useState('default')
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('notifications').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    fetchNotifications()
    if (permissionPushDisponible()) setPermPush(Notification.permission)

    // Realtime
    const canal = supabase
      .channel(`notifs-page-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchNotifications())
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [user, navigate, fetchNotifications])

  const marquerToutesLues = async () => {
    await supabase.from('notifications')
      .update({ lu: true }).eq('user_id', user.id).eq('lu', false)
    fetchNotifications()
  }

  const supprimerTout = async () => {
    if (!window.confirm('Supprimer toutes les notifications ?')) return
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
  }

  const supprimerUne = async (id, e) => {
    e.stopPropagation()
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const ouvrirNotif = async (notif) => {
    if (!notif.lu) {
      await supabase.from('notifications').update({ lu: true }).eq('id', notif.id)
    }
    if (notif.lien) navigate(notif.lien)
  }

  const activerPush = async () => {
    const result = await demanderPermissionPush()
    setPermPush(result)
  }

  const notifsFiltrees = notifications.filter(n => {
    if (filtre === 'toutes') return true
    if (filtre === 'non_lues') return !n.lu
    if (filtre === 'admin') return n.type?.startsWith('admin_')
    return n.type === filtre
  })
  const nonLuesCount = notifications.filter(n => !n.lu).length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Chargement…
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="relative overflow-hidden border-b border-gold-500/15">
        <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-10">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div>
              <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2">
                · Activité ·
              </p>
              <h1 className="font-display text-4xl text-gold-shine">Notifications</h1>
              <p className="text-navy-200/70 text-sm mt-1 font-sans">
                {nonLuesCount} non lue{nonLuesCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {nonLuesCount > 0 && (
                <button
                  onClick={marquerToutesLues}
                  className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-2 rounded-full font-sans hover:bg-emerald-900/50 transition"
                >
                  ✓ Tout marquer lu
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={supprimerTout}
                  className="bg-red-900/30 border border-red-500/30 text-red-300 text-xs px-4 py-2 rounded-full font-sans hover:bg-red-900/50 transition"
                >
                  🗑️ Tout supprimer
                </button>
              )}
            </div>
          </div>

          {permissionPushDisponible() && permPush === 'default' && (
            <div className="mt-5 bg-gold-900/20 border border-gold-500/30 rounded-2xl p-4 flex justify-between items-center gap-3 flex-wrap">
              <div className="flex-1">
                <p className="font-display text-base text-gold-shine">Active les notifications push</p>
                <p className="font-sans text-xs text-navy-200/70">Reçois une alerte de ton navigateur même si tu fermes l'app.</p>
              </div>
              <button onClick={activerPush} className="btn-gold px-5 py-2 rounded-full text-xs whitespace-nowrap">
                Activer
              </button>
            </div>
          )}
          {permPush === 'denied' && (
            <p className="mt-3 text-xs text-red-300/70 font-sans">
              ⚠ Notifications push refusées. Pour les réactiver, vérifie les permissions du site dans ton navigateur.
            </p>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-navy border-b border-gold-500/10 sticky top-[73px] z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {FILTRES.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltre(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition border ${
                filtre === f.id
                  ? 'bg-gold-shine text-navy-950 border-transparent shadow-gold-glow font-semibold'
                  : 'bg-navy-800/60 text-navy-100/70 border-navy-700 hover:border-gold-500/40 hover:text-gold-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {notifsFiltrees.length === 0 ? (
          <div className="text-center py-24 text-navy-200/60">
            <p className="text-5xl mb-4">🔔</p>
            <p className="font-display text-2xl italic">
              {filtre === 'toutes' ? 'Aucune notification' : 'Rien dans cette catégorie'}
            </p>
            <p className="text-sm mt-2 font-sans">
              Tu seras notifié quand quelqu'un interagit avec ta boutique
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifsFiltrees.map(notif => (
              <div
                key={notif.id}
                onClick={() => ouvrirNotif(notif)}
                className={`rounded-2xl p-4 border transition cursor-pointer hover:border-gold-500/40 group ${
                  !notif.lu ? 'bg-gold-500/5 border-gold-500/30' : 'bg-navy-800/50 border-navy-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{ICONES_NOTIF[notif.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-sans leading-relaxed ${!notif.lu ? 'text-navy-100' : 'text-navy-200/80'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-navy-200/50 mt-1 font-sans">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {!notif.lu && (
                      <div className="w-2 h-2 bg-gold-shine rounded-full shadow-gold-glow" />
                    )}
                    <button
                      onClick={(e) => supprimerUne(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-navy-200/50 hover:text-red-300 text-sm transition"
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
