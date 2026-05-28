import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'

export default function ModifierProduit() {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [categorie, setCategorie] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [imageActuelle, setImageActuelle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const { produitId } = useParams()
  const navigate = useNavigate()

  const fetchProduit = useCallback(async () => {
    const { data } = await supabase
      .from('produits').select('*').eq('id', produitId).single()
    if (data) {
      setNom(data.nom)
      setDescription(data.description || '')
      setPrix(data.prix)
      setCategorie(data.categorie || '')
      setImageActuelle(data.image_url)
    }
  }, [produitId])

  useEffect(() => {
    fetchProduit()
  }, [fetchProduit])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    let image_url = imageActuelle

    if (image) {
      const ext = image.name.split('.').pop()
      const fileName = `produits/${produitId}-${Date.now()}.${ext}`
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

    const { error } = await supabase
      .from('produits')
      .update({ nom, description, prix: parseFloat(prix), categorie, image_url })
      .eq('id', produitId)

    if (error) setErreur(`Erreur: ${error.message}`)
    else navigate(-1)

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-950 py-10 px-4">
      <div className="max-w-lg mx-auto glass-navy border border-gold-500/20 rounded-3xl p-7 sm:p-9 shadow-card-dark">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-2 text-center">
          · Édition ·
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-gold-shine mb-1 text-center">
          Modifier le produit
        </h1>
        <p className="text-navy-200/70 font-display italic text-sm mb-7 text-center">
          Mets à jour les infos du produit
        </p>

        {erreur && (
          <p className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm">{erreur}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-48 sm:h-56 rounded-2xl bg-navy-900 flex items-center justify-center overflow-hidden border-2 border-dashed border-gold-500/30">
              {preview || imageActuelle ? (
                <img src={preview || imageActuelle} alt={nom} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <p className="text-navy-200/50 text-sm font-display italic">Photo du produit</p>
              )}
            </div>
            <label className="cursor-pointer bg-navy-800 border border-gold-500/30 text-gold-300 px-5 py-2 rounded-full text-sm font-sans hover:bg-navy-700 hover:border-gold-500/60 transition">
              Changer la photo
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-navy-200/70 mb-2 font-sans">Nom du produit</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

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
              className="input-dark w-full rounded-lg px-4 py-3 font-sans text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-full text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement…' : 'Mettre à jour'}
          </button>
        </form>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 bg-navy-800 border border-navy-700 text-navy-200/80 py-3 rounded-full font-sans hover:bg-navy-700 transition text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
