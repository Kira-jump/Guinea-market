import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CreerBoutique() {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [boutique, setBoutique] = useState(null)
  const [checkDone, setCheckDone] = useState(false)
  const { user, refreshBoutique } = useAuth()
  const navigate = useNavigate()

  const fetchMaBoutique = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('boutiques')
      .select('*')
      .eq('vendeur_id', user.id)
      .maybeSingle()
    if (data) {
      setBoutique(data)
      setNom(data.nom)
      setDescription(data.description || '')
      setWhatsapp(data.whatsapp || '')
    }
    setCheckDone(true)
  }, [user])

  useEffect(() => {
    if (user) fetchMaBoutique()
  }, [user, fetchMaBoutique])

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    try {
      if (!user) {
        setErreur('Session expiree, reconnecte-toi.')
        setLoading(false)
        return
      }

      let logo_url = boutique?.logo_url || null

      if (logo) {
        const ext = logo.name.split('.').pop()
        const fileName = `logos/${user.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('images').upload(fileName, logo)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setErreur(`Erreur upload: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
        logo_url = urlData?.publicUrl || null
      }

      if (boutique) {
        const { error } = await supabase.from('boutiques')
          .update({ nom, description, whatsapp, logo_url })
          .eq('id', boutique.id)
        if (error) {
          console.error('Update boutique error:', error)
          setErreur(`Erreur: ${error.message}`)
          setLoading(false)
          return
        }
        setLoading(false)
        navigate(`/boutique/${boutique.id}`)
      } else {
        const { data, error } = await supabase.from('boutiques')
          .insert({ vendeur_id: user.id, nom, description, whatsapp, logo_url })
          .select().single()

        if (error) {
          console.error('Insert boutique error:', error)
          setErreur(`Erreur: ${error.message}`)
          setLoading(false)
          return
        }
        if (!data) {
          console.error('Insert boutique: data null sans erreur')
          setErreur('Creation OK mais reponse vide. Rafraichis la page.')
          setLoading(false)
          return
        }

        setBoutique(data)
        if (refreshBoutique) await refreshBoutique()
        setLoading(false)
        navigate(`/boutique/${data.id}`)
      }
    } catch (err) {
      console.error('handleSubmit crash:', err)
      setErreur(`Erreur inattendue: ${err?.message || err}`)
      setLoading(false)
    }
  }

  if (!checkDone && user) return (
    <div className="min-h-screen flex items-center justify-center text-navy-200/60 font-display italic">
      Chargement…
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-950 py-10 px-4">
      <div className="max-w-lg mx-auto glass-navy border border-gold-500/20 rounded-3xl p-7 sm:p-9 shadow-card-dark">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2 text-center">
          · Espace vendeur ·
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-gold-shine mb-1 text-center">
          {boutique ? 'Ma boutique' : 'Créer ma boutique'}
        </h1>
        <p className="text-navy-200/70 font-display italic text-sm mb-7 text-center">
          {boutique ? 'Modifie les infos de ta boutique' : 'Configure ta boutique en quelques secondes'}
        </p>

        {erreur && (
          <p className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm">{erreur}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-navy-800 flex items-center justify-center overflow-hidden border-2 border-gold-500/40 shadow-gold-glow">
              {preview || boutique?.logo_url ? (
                <img src={preview || boutique?.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy-200/50 text-xs font-sans">Logo</span>
              )}
            </div>
            <label className="cursor-pointer bg-navy-800 border border-gold-500/30 text-gold-300 px-5 py-2 rounded-full text-sm font-sans hover:bg-navy-700 hover:border-gold-500/60 transition">
              Choisir un logo
              <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Nom de la boutique</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Mode Conakry"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris ce que tu vends…"
              rows={3}
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Numéro WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 224621000000"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
            <p className="text-xs text-navy-200/50 mt-1 font-sans">Format international sans + (224XXXXXXXXX)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement…' : boutique ? 'Mettre à jour' : 'Créer ma boutique'}
          </button>
        </form>

        {boutique && (
          <button
            onClick={() => navigate(`/ajouter-produit/${boutique.id}`)}
            className="btn-emerald w-full mt-3 py-3 rounded-full text-sm tracking-wide"
          >
            + Ajouter des produits
          </button>
        )}
      </div>
    </div>
  )
}
