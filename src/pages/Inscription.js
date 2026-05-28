import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { creerNotification, TYPES_NOTIF } from '../lib/notifications'

export default function Inscription() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [role, setRole] = useState('acheteur')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  const traduireErreur = (err) => {
    const msg = err?.message || String(err)
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
      return "Connexion au serveur impossible. Vérifie ton internet — si le problème persiste, l'email de confirmation Supabase n'est peut-être pas configuré (désactive-le dans le dashboard ou configure le SMTP)."
    }
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already')) {
      return "Cet email est déjà utilisé. Connecte-toi à la place."
    }
    if (msg.toLowerCase().includes('password')) {
      return "Mot de passe trop court (minimum 6 caractères)."
    }
    if (msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('email')) {
      return "Email invalide."
    }
    return msg
  }

  const handleInscription = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: motDePasse,
        options: {
          emailRedirectTo: window.location.origin,
          data: { nom, role },
        },
      })

      if (error) {
        setErreur(traduireErreur(error))
        setLoading(false)
        return
      }

      if (!data?.user) {
        setErreur("Création échouée. Réessaie dans un instant.")
        setLoading(false)
        return
      }

      // Tentative de création du profil (n'empêche pas l'inscription si ça rate)
      try {
        await supabase.from('profiles').insert({
          id: data.user.id, nom, role,
        })
      } catch (profileErr) {
        console.error('Profile insert error:', profileErr)
      }

      // Notification de bienvenue
      const messageBienvenue = role === 'vendeur'
        ? `🎉 Bienvenue ${nom} ! Crée ta première boutique et commence à vendre.`
        : `🎉 Bienvenue ${nom} ! Découvre les boutiques d'exception de ShopGN.`
      await creerNotification({
        user_id: data.user.id,
        type: TYPES_NOTIF.BIENVENUE,
        message: messageBienvenue,
        lien: role === 'vendeur' ? '/creer-boutique' : '/',
      })

      setLoading(false)

      if (role === 'vendeur') navigate('/creer-boutique')
      else navigate('/')
    } catch (e) {
      setErreur(traduireErreur(e))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 bg-navy-950 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

      <div className="glass-navy border border-gold-500/20 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-card-dark relative z-10">
        <div className="text-center mb-8">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-3">
            · Rejoins-nous ·
          </p>
          <h1 className="font-display text-4xl text-gold-shine mb-1">ShopGN</h1>
          <p className="font-display italic text-navy-200/70 text-sm">Crée ton compte</p>
        </div>

        {erreur && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm font-sans">
            {erreur}
          </div>
        )}

        <form onSubmit={handleInscription} className="space-y-4">
          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Ton nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Mamadou Diallo"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@gmail.com"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Minimum 6 caractères"
              minLength={6}
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Tu veux :</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('acheteur')}
                className={`p-4 rounded-xl border-2 text-center transition-all font-sans ${
                  role === 'acheteur'
                    ? 'border-gold-500 bg-gold-500/10 text-gold-200'
                    : 'border-navy-700 text-navy-200/70 hover:border-navy-500'
                }`}
              >
                <div className="text-2xl mb-1">🛒</div>
                <div className="text-sm">Acheter</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('vendeur')}
                className={`p-4 rounded-xl border-2 text-center transition-all font-sans ${
                  role === 'vendeur'
                    ? 'border-gold-500 bg-gold-500/10 text-gold-200'
                    : 'border-navy-700 text-navy-200/70 hover:border-navy-500'
                }`}
              >
                <div className="text-2xl mb-1">🏪</div>
                <div className="text-sm">Vendre</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création…' : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-navy-200/70 mt-6 font-sans">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-gold-300 hover:text-gold-200 underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
