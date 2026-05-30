import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

export default function Inscription() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  const traduireErreur = (err) => {
    const msg = err?.message || String(err)
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
      return "Connexion au serveur impossible. Vérifie ton internet."
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
          data: { nom },
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

      setLoading(false)
      navigate('/')
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

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création…' : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-xs text-navy-200/50 mt-6 font-sans">
          Achète librement, et ouvre ta boutique quand tu veux.
        </p>

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
