import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNotificationsRealtime } from '../hooks/useNotificationsRealtime'
import { ICONES_NOTIF, demanderPermissionPush } from '../lib/notifications'

export default function Navbar() {
  const { user, profile, boutique } = useAuth()
  const hasBoutique = !!boutique
  const navigate = useNavigate()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [dropdownOuvert, setDropdownOuvert] = useState(false)
  const dropdownRef = useRef(null)
  const { notifications, nonLues, marquerCommeLue, marquerToutesLues } = useNotificationsRealtime()

  // Demande la permission push une fois après connexion (utilisateur peut refuser ou accepter)
  useEffect(() => {
    if (user) {
      const dejaDemande = localStorage.getItem('push_perm_demande')
      if (!dejaDemande) {
        setTimeout(() => {
          demanderPermissionPush()
          localStorage.setItem('push_perm_demande', '1')
        }, 5000) // attend 5s pour ne pas spammer
      }
    }
  }, [user])

  // Ferme dropdown sur clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOuvert(false)
      }
    }
    if (dropdownOuvert) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOuvert])

  const deconnexion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const ouvrirNotif = (n) => {
    if (!n.lu) marquerCommeLue(n.id)
    setDropdownOuvert(false)
    if (n.lien) navigate(n.lien)
    else navigate('/notifications')
  }

  const badgeRole = hasBoutique
    ? <span className="font-sans text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold-500/40 text-gold-300 bg-gold-900/30">Vendeur</span>
    : null

  const navLink = "font-sans text-sm text-navy-100/80 hover:text-gold-300 transition tracking-wide"

  const BellDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOuvert(o => !o)}
        className="relative text-navy-100/80 hover:text-gold-300 transition text-lg p-1"
        aria-label="Notifications"
      >
        <span>🔔</span>
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-gold-shine text-navy-950 text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {dropdownOuvert && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-navy border border-gold-500/30 rounded-2xl shadow-card-dark overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-navy-700 flex justify-between items-center">
            <p className="font-display text-lg text-gold-shine">Notifications</p>
            {nonLues > 0 && (
              <button
                onClick={marquerToutesLues}
                className="text-[10px] tracking-widest uppercase text-gold-300 hover:text-gold-200 font-sans"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-navy-200/60">
                <p className="text-3xl mb-2">🔔</p>
                <p className="font-display italic text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <button
                  key={n.id}
                  onClick={() => ouvrirNotif(n)}
                  className={`w-full text-left px-4 py-3 border-b border-navy-700 last:border-0 hover:bg-navy-800/60 transition flex items-start gap-3 ${
                    !n.lu ? 'bg-gold-500/5' : ''
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{ICONES_NOTIF[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug font-sans ${!n.lu ? 'text-navy-100' : 'text-navy-200/70'} line-clamp-2`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-navy-200/50 mt-1 font-sans">
                      {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.lu && <div className="w-2 h-2 bg-gold-shine rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setDropdownOuvert(false)}
            className="block text-center py-3 border-t border-navy-700 text-sm font-sans tracking-wider uppercase text-gold-300 hover:bg-navy-800/60 transition"
          >
            Voir toutes
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <nav className="glass-navy sticky top-0 z-40 border-b border-gold-500/15">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-baseline gap-1.5 group">
          <span className="font-display text-3xl font-semibold text-gold-shine tracking-wide leading-none">
            ShopGN
          </span>
          <span className="font-display italic text-xs text-navy-200/60 hidden sm:inline">
            · maison
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex gap-6 items-center">
          {user ? (
            <>
              <Link to="/" className={navLink}>Accueil</Link>
              <Link to="/feed" className={navLink}>Feed</Link>
              {hasBoutique ? (
                <>
                  <Link to="/creer-boutique" className={navLink}>Ma boutique</Link>
                  <Link to="/dashboard" className={navLink}>Dashboard</Link>
                </>
              ) : (
                <Link to="/creer-boutique" className="font-sans text-sm text-gold-300 hover:text-gold-200 transition tracking-wide flex items-center gap-1">
                  🏪 Créer ma boutique
                </Link>
              )}
              <BellDropdown />
              <Link to="/profil" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-navy-600 hover:border-gold-500/50 transition">
                <span className="text-navy-100 font-sans text-sm">{profile?.nom}</span>
                {badgeRole}
              </Link>
              <button
                onClick={deconnexion}
                className="btn-gold px-5 py-2 rounded-full text-sm"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className={navLink}>Connexion</Link>
              <Link to="/inscription" className="btn-gold px-5 py-2 rounded-full text-sm">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          {user && <BellDropdown />}
          <button
            className="text-gold-300 text-2xl focus:outline-none"
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label="Menu"
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden glass-navy border-t border-gold-500/10 px-4 pb-5 flex flex-col gap-3 text-sm shadow-card-dark">
          {user ? (
            <>
              <div className="flex items-center gap-2 pt-4 pb-3 border-b border-navy-700">
                <span className="text-navy-100 font-sans">{profile?.nom}</span>
                {badgeRole}
              </div>
              <Link to="/" onClick={() => setMenuOuvert(false)} className={navLink + " py-1"}>Accueil</Link>
              <Link to="/feed" onClick={() => setMenuOuvert(false)} className={navLink + " py-1"}>Feed</Link>
              {hasBoutique ? (
                <>
                  <Link to="/creer-boutique" onClick={() => setMenuOuvert(false)} className={navLink + " py-1"}>Ma boutique</Link>
                  <Link to="/dashboard" onClick={() => setMenuOuvert(false)} className={navLink + " py-1"}>Dashboard</Link>
                </>
              ) : (
                <Link to="/creer-boutique" onClick={() => setMenuOuvert(false)} className="font-sans text-sm text-gold-300 py-1 flex items-center gap-1">
                  🏪 Créer ma boutique
                </Link>
              )}
              <Link to="/notifications" onClick={() => setMenuOuvert(false)} className={navLink + " py-1"}>
                Notifications {nonLues > 0 && <span className="ml-1 text-gold-shine">({nonLues})</span>}
              </Link>
              <Link to="/profil" onClick={() => setMenuOuvert(false)} className={navLink + " py-1"}>Mon profil</Link>
              <button onClick={deconnexion} className="btn-gold mt-2 w-full py-2.5 rounded-full text-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setMenuOuvert(false)} className={navLink + " pt-4 pb-1"}>Connexion</Link>
              <Link to="/inscription" onClick={() => setMenuOuvert(false)} className="btn-gold py-2.5 rounded-full text-center text-sm">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
