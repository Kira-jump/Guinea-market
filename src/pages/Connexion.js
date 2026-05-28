import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

export default function Connexion() {
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
    if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('credentials')) {
      return "Email ou mot de passe incorrect."
    }
    if (msg.toLowerCase().includes('email not confirmed')) {
      return "Email pas encore confirmé. Vérifie ta boîte mail."
    }
    return msg
  }

  const handleConnexion = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: motDePasse,
      })

      if (error) {
        setErreur(traduireErreur(error))
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
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-navy-950 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

      <div className="glass-navy border border-gold-500/20 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-card-dark relative z-10">
        <div className="text-center mb-8">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-3">
            · Bienvenue ·
          </p>
          <h1 className="font-display text-4xl text-gold-shine mb-1">ShopGN</h1>
          <p className="font-display italic text-navy-200/70 text-sm">Connecte-toi à ton compte</p>
        </div>

        {erreur && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm font-sans">
            {erreur}
          </div>
        )}

        <form onSubmit={handleConnexion} className="space-y-4">
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
              placeholder="Ton mot de passe"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-navy-200/70 mt-6 font-sans">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-gold-300 hover:text-gold-200 underline underline-offset-2">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
