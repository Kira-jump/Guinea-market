import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'
import { notifierFollowers, TYPES_NOTIF } from '../lib/notifications'

export default function AjouterProduit() {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [categorie, setCategorie] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)
  const { boutiqueId } = useParams()
  const navigate = useNavigate()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categorie) {
      setErreur('Choisis une catégorie')
      return
    }
    setLoading(true)
    setErreur('')
    setSucces(false)

    let image_url = null

    if (image) {
      const ext = image.name.split('.').pop()
      const fileName = `produits/${boutiqueId}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('images').upload(fileName, image)

      if (uploadError) {
        setErreur(`Erreur upload: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('produits').insert({
      boutique_id: boutiqueId, nom, description,
      prix: parseFloat(prix), image_url, categorie,
    })

    if (error) {
      setErreur(`Erreur: ${error.message}`)
    } else {
      setSucces(true)
      // Notifier tous les followers de la boutique
      try {
        const { data: bt } = await supabase.from('boutiques').select('nom').eq('id', boutiqueId).single()
        await notifierFollowers(
          boutiqueId,
          `📦 Nouveau produit chez ${bt?.nom || 'une boutique que tu suis'} : ${nom}`,
          `/boutique/${boutiqueId}`,
          TYPES_NOTIF.PRODUIT,
        )
      } catch (notifErr) { /* silencieux */ }
      setNom(''); setDescription(''); setPrix(''); setCategorie('')
      setImage(null); setPreview(null)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-950 py-10 px-4">
      <div className="max-w-lg mx-auto glass-navy border border-gold-500/20 rounded-3xl p-7 sm:p-9 shadow-card-dark">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2 text-center">
          · Nouveau produit ·
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-gold-shine mb-1 text-center">
          Ajouter un produit
        </h1>
        <p className="text-navy-200/70 font-display italic text-sm mb-7 text-center">
          Enrichis ta boutique d'une pièce d'exception
        </p>

        {erreur && (
          <p className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm">{erreur}</p>
        )}
        {succes && (
          <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
            <span>✓ Produit ajouté !</span>
            <button
              onClick={() => navigate(`/boutique/${boutiqueId}`)}
              className="underline text-gold-300 font-sans"
            >
              Voir la boutique
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-48 sm:h-56 rounded-2xl bg-navy-900 flex items-center justify-center overflow-hidden border-2 border-dashed border-gold-500/30">
              {preview ? (
                <img src={preview} alt="produit" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="text-center text-navy-200/50 font-display italic">Photo du produit</div>
              )}
            </div>
            <label className="cursor-pointer bg-navy-800 border border-gold-500/30 text-gold-300 px-5 py-2 rounded-full text-sm font-sans hover:bg-navy-700 hover:border-gold-500/60 transition">
              Choisir une photo
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Nom du produit</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Robe wax taille M"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Type de produit</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.filter(c => c.id !== 'tout').map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategorie(cat.id)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all text-xs relative font-sans ${
                    categorie === cat.id
                      ? 'border-gold-500 bg-gold-500/10 text-gold-200'
                      : 'border-navy-700 text-navy-200/70 hover:border-navy-500'
                  }`}
                >
                  {categorie === cat.id && (
                    <span className="absolute top-1 right-1 text-gold-400 text-xs">✓</span>
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris ton produit…"
              rows={2}
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Prix (GNF)</label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="Ex: 150000"
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ajout en cours…' : '+ Ajouter le produit'}
          </button>
        </form>

        <button
          onClick={() => navigate(`/boutique/${boutiqueId}`)}
          className="w-full mt-3 bg-navy-800 border border-navy-700 text-navy-200/80 py-3 rounded-full font-sans hover:bg-navy-700 transition text-sm"
        >
          Voir ma boutique
        </button>
      </div>
    </div>
  )
}
