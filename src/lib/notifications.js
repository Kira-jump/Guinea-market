import { supabase } from './supabase'

export const TYPES_NOTIF = {
  FOLLOW: 'follow',
  AVIS: 'avis',
  PRODUIT: 'produit',
  BIENVENUE: 'bienvenue',
  ADMIN_EPINGLE: 'admin_epingle',
  ADMIN_BLOQUE: 'admin_bloque',
  ADMIN_DEBLOQUE: 'admin_debloque',
  SYSTEME: 'systeme',
}

export const ICONES_NOTIF = {
  follow: '👥',
  avis: '⭐',
  produit: '📦',
  bienvenue: '🎉',
  admin_epingle: '✨',
  admin_bloque: '🚫',
  admin_debloque: '✅',
  systeme: '🔔',
}

export async function creerNotification({ user_id, type, message, lien = null }) {
  if (!user_id || !message) return null
  try {
    const { data, error } = await supabase.from('notifications').insert({
      user_id, type, message, lien, lu: false,
    }).select().single()
    if (error) throw error
    return data
  } catch (e) {
    console.error('creerNotification:', e)
    return null
  }
}

export async function notifierFollowers(boutiqueId, message, lien, type = TYPES_NOTIF.PRODUIT) {
  try {
    const { data: follows } = await supabase
      .from('follows').select('acheteur_id').eq('boutique_id', boutiqueId)
    if (!follows || follows.length === 0) return 0
    const notifications = follows.map(f => ({
      user_id: f.acheteur_id, type, message, lien, lu: false,
    }))
    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) throw error
    return notifications.length
  } catch (e) {
    console.error('notifierFollowers:', e)
    return 0
  }
}

export function permissionPushDisponible() {
  return 'Notification' in window
}

export async function demanderPermissionPush() {
  if (!permissionPushDisponible()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch (e) {
    return 'denied'
  }
}

export function afficherPush({ titre, corps, lien }) {
  if (!permissionPushDisponible() || Notification.permission !== 'granted') return
  try {
    const notif = new Notification(titre, {
      body: corps,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'shopgn-' + Date.now(),
    })
    if (lien) {
      notif.onclick = () => {
        window.focus()
        window.location.href = lien
      }
    }
    setTimeout(() => notif.close(), 6000)
  } catch (e) { /* silencieux */ }
}
