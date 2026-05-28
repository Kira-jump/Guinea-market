import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USER = 'admin'
const ADMIN_PWD = 'shopgn2026'

export default function AdminLogin() {
  const [nom, setNom] = useState('')
  const [pwd, setPwd] = useState('')
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (nom === ADMIN_USER && pwd === ADMIN_PWD) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin')
    } else {
      setErreur('Identifiants incorrects')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="glass-navy border border-gold-500/20 rounded-3xl p-8 w-full max-w-sm shadow-card-dark relative z-10">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2 text-center">
          · Espace privé ·
        </p>
        <h1 className="font-display text-3xl text-gold-shine text-center mb-1">ShopGN</h1>
        <p className="text-navy-200/70 text-center text-sm font-display italic mb-8">Panel administrateur</p>

        {erreur && (
          <p className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm text-center">{erreur}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Nom d'utilisateur</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="admin"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Mot de passe</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
