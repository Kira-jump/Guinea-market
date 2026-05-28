import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ICONES_NOTIF, afficherPush } from '../lib/notifications'

export function useNotificationsRealtime() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [nonLues, setNonLues] = useState(0)

  const charger = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('notifications').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data || [])
      setNonLues((data || []).filter(n => !n.lu).length)
    } catch (e) { /* silencieux */ }
  }, [user])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setNonLues(0)
      return
    }
    charger()

    // Abonnement realtime
    const canal = supabase
      .channel(`notifs-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const notif = payload.new
        setNotifications(prev => [notif, ...prev].slice(0, 20))
        setNonLues(prev => prev + 1)

        // Toast in-app
        toast({
          titre: 'Nouvelle notification',
          message: notif.message,
          icone: ICONES_NOTIF[notif.type] || '🔔',
          lien: notif.lien,
        })

        // Push système (si permission accordée)
        afficherPush({
          titre: 'ShopGN',
          corps: notif.message,
          lien: notif.lien,
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [user, charger, toast])

  const marquerCommeLue = useCallback(async (id) => {
    try {
      await supabase.from('notifications').update({ lu: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
      setNonLues(prev => Math.max(0, prev - 1))
    } catch (e) { /* silencieux */ }
  }, [])

  const marquerToutesLues = useCallback(async () => {
    if (!user) return
    try {
      await supabase.from('notifications')
        .update({ lu: true }).eq('user_id', user.id).eq('lu', false)
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
      setNonLues(0)
    } catch (e) { /* silencieux */ }
  }, [user])

  return { notifications, nonLues, charger, marquerCommeLue, marquerToutesLues }
}
