import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ImageViewer from '../components/ImageViewer'
import CarouselProduits from '../components/CarouselProduits'

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Accueil() {
  const [produits, setProduits] = useState([])
  const [produitsMelanges, setProduitsMelanges] = useState([])
  const [boutiquesEpinglees, setBoutiquesEpinglees] = useState([])
  const [produitsEpingles, setProduitsEpingles] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorieActive, setCategorieActive] = useState('tout')
  const [imageSelectionnee, setImageSelectionnee] = useState(null)
  const [animation, setAnimation] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduits()
    fetchEpingles()
  }, [])

  const fetchEpingles = async () => {
    try {
      const { data: bts } = await supabase
        .from('boutiques')
        .select('id, nom, logo_url, description, followers_count')
        .eq('epinglee', true)
        .order('epinglee_position', { ascending: false })
        .limit(8)
      setBoutiquesEpinglees(bts || [])

      const { data: prds } = await supabase
        .from('produits')
        .select('*, boutiques(id, nom, logo_url, whatsapp)')
        .eq('epingle', true)
        .order('epingle_position', { ascending: false })
        .limit(8)
      setProduitsEpingles(prds || [])
    } catch (e) {
      // Colonnes pas encore créées en base — pas grave
    }
  }

  const melangerProduits = useCallback((liste) => {
    setAnimation(true)
    setTimeout(() => {
      setProduitsMelanges(shuffleArray(liste))
      setAnimation(false)
    }, 300)
  }, [])

  useEffect(() => {
    if (produits.length > 0) {
      melangerProduits(produits)
      const interval = setInterval(() => melangerProduits(produits), 15000)
      return () => clearInterval(interval)
    }
  }, [produits, melangerProduits])

  const fetchProduits = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*, boutiques(id, nom, logo_url, whatsapp)')
    setProduits(data || [])
    setLoading(false)
  }

  const handleCommander = (e) => {
    if (!user) {
      e.preventDefault()
      navigate('/inscription')
    }
  }

  const produitsFiltres = produitsMelanges.filter(p => {
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      p.boutiques?.nom.toLowerCase().includes(recherche.toLowerCase())
    const matchCategorie = categorieActive === 'tout' || p.categorie === categorieActive
    return matchRecherche && matchCategorie
  })

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero raffiné */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
          <p className="font-sans text-[11px] tracking-[0.4em] uppercase text-gold-400/80 mb-4">
            · La marketplace raffinée de Guinée ·
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-tight mb-4">
            <span className="text-gold-shine">ShopGN</span>
            <span className="block font-display italic text-2xl sm:text-3xl text-navy-100/80 mt-2">
              maison d'artisans &amp; créateurs
            </span>
          </h1>
          <p className="font-sans text-navy-200/70 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Découvre des boutiques d'exception, soigneusement sélectionnées —
            mode, beauté, électronique, alimentation et bien plus.
          </p>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit ou une boutique…"
              className="input-dark w-full px-6 py-4 rounded-full font-sans text-sm pr-14"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-400">🔍</span>
          </div>
        </div>
      </div>

      {/* À la une — boutiques épinglées */}
      {boutiquesEpinglees.length > 0 && (
        <div className="bg-navy-900/60 border-y border-gold-500/15 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-1">
                  · Mises en avant ·
                </p>
                <h2 className="font-display text-3xl text-gold-shine">À la une</h2>
              </div>
              <span className="font-sans text-xs text-navy-200/60 hidden sm:inline">
                Maisons sélectionnées
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {boutiquesEpinglees.map(b => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/boutique/${b.id}`)}
                  className="group bg-navy-800/70 rounded-2xl border border-gold-500/30 hover:border-gold-500/70 hover:shadow-gold-glow transition-all cursor-pointer overflow-hidden relative"
                >
                  <span className="absolute top-2 left-2 z-10 bg-gold-shine text-navy-950 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                    ⭐ À la une
                  </span>
                  <div className="h-32 sm:h-40 bg-navy-900 overflow-hidden">
                    {b.logo_url ? (
                      <img src={b.logo_url} alt={b.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-navy-600 text-4xl">🏪</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-base text-navy-100 truncate">{b.nom}</h3>
                    <p className="text-[10px] text-navy-200/60 mt-1 font-sans">
                      {b.followers_count || 0} followers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Produits à la une */}
      {produitsEpingles.length > 0 && (
        <div className="bg-navy-900/40 py-8 border-b border-gold-500/15">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-400/80 mb-1">
                  · Coups de cœur ·
                </p>
                <h2 className="font-display text-3xl text-gold-shine">Sélection du moment</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {produitsEpingles.map(produit => (
                <div
                  key={produit.id}
                  className="group bg-navy-800/70 rounded-2xl overflow-hidden border border-gold-500/30 hover:border-gold-500/70 hover:shadow-gold-glow transition-all duration-300 relative"
                >
                  <span className="absolute top-2 left-2 z-10 bg-gold-shine text-navy-950 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                    ⭐
                  </span>
                  <div
                    className="relative overflow-hidden bg-navy-900 cursor-zoom-in"
                    style={{ paddingBottom: '110%' }}
                    onClick={() => produit.image_url && setImageSelectionnee(produit)}
                  >
                    {produit.image_url ? (
                      <img src={produit.image_url} alt={produit.nom} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-navy-600 text-5xl">📦</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div onClick={() => navigate(`/boutique/${produit.boutiques?.id}`)} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gold-500/30">
                        {produit.boutiques?.logo_url ? (
                          <img src={produit.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full bg-navy-700" />}
                      </div>
                      <span className="text-xs text-navy-200/60 truncate hover:text-gold-300 font-sans">{produit.boutiques?.nom}</span>
                    </div>
                    <h3 className="font-display text-base text-navy-100 line-clamp-1">{produit.nom}</h3>
                    <p className="text-gold-shine font-display text-lg font-semibold mt-1">
                      {produit.prix.toLocaleString()} GNF
                    </p>
                    <a
                      href={user ? `https://wa.me/${produit.boutiques?.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`)}` : '#'}
                      target={user ? '_blank' : '_self'}
                      rel="noreferrer"
                      onClick={handleCommander}
                      className="btn-emerald block w-full text-center text-xs py-2 rounded-lg mt-2 font-sans"
                    >
                      Commander
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
      {!loading && produits.length > 0 && (
        <CarouselProduits produits={shuffleArray(produits)} />
      )}

      {/* Catégories */}
      <div className="glass-navy border-y border-gold-500/10 sticky top-[73px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategorieActive(cat.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm font-sans tracking-wide transition-all border ${
                  categorieActive === cat.id
                    ? 'bg-gold-shine text-navy-950 border-transparent shadow-gold-glow font-semibold'
                    : 'bg-navy-800/60 text-navy-100/70 border-navy-700 hover:border-gold-500/40 hover:text-gold-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8 border-b border-navy-700 pb-4">
          <div>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold-400/70 mb-1">
              Collection
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-navy-100">
              {categorieActive === 'tout' ? 'Tous les produits' : CATEGORIES.find(c => c.id === categorieActive)?.label}
            </h2>
          </div>
          <span className="font-sans text-navy-200/60 text-xs sm:text-sm">
            {produitsFiltres.length} pièce{produitsFiltres.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-24 text-navy-200/60 font-display italic">Chargement…</div>
        ) : produitsFiltres.length === 0 ? (
          <div className="text-center py-24 text-navy-200/60">
            <p className="font-display text-xl italic">Aucun produit trouvé</p>
            {categorieActive !== 'tout' && (
              <button onClick={() => setCategorieActive('tout')} className="mt-4 text-gold-400 hover:text-gold-300 underline text-sm font-sans">
                Voir tous les produits
              </button>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 transition-opacity duration-300 ${animation ? 'opacity-0' : 'opacity-100'}`}>
            {produitsFiltres.map(produit => (
              <div
                key={produit.id}
                className="group bg-navy-800/50 rounded-2xl overflow-hidden border border-navy-700 hover:border-gold-500/40 hover:shadow-card-dark transition-all duration-300"
              >
                <div
                  className="relative overflow-hidden bg-navy-900 cursor-zoom-in"
                  style={{ paddingBottom: '110%' }}
                  onClick={() => produit.image_url && setImageSelectionnee(produit)}
                >
                  <div className="absolute inset-0">
                    {produit.image_url ? (
                      <img
                        src={produit.image_url}
                        alt={produit.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-navy-600">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-3 sm:p-4">
                  <div
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                    onClick={() => navigate(`/boutique/${produit.boutiques?.id}`)}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gold-500/30">
                      {produit.boutiques?.logo_url ? (
                        <img src={produit.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-navy-700" />
                      )}
                    </div>
                    <span className="text-xs text-navy-200/60 truncate hover:text-gold-300 transition font-sans">
                      {produit.boutiques?.nom}
                    </span>
                  </div>

                  <h3 className="font-display text-base text-navy-100 line-clamp-2 leading-snug mb-2">
                    {produit.nom}
                  </h3>

                  <p className="text-gold-shine font-display text-lg font-semibold mb-3 tracking-wide">
                    {produit.prix.toLocaleString()} GNF
                  </p>

                  <a
                    href={user ? `https://wa.me/${produit.boutiques?.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`)}` : '#'}
                    target={user ? "_blank" : "_self"}
                    rel="noreferrer"
                    onClick={handleCommander}
                    className="btn-emerald block w-full text-center text-xs py-2.5 rounded-lg font-sans"
                  >
                    Commander
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer signature */}
      <footer className="border-t border-gold-500/10 mt-12 py-10 text-center">
        <p className="font-display text-2xl text-gold-shine mb-2">ShopGN</p>
        <p className="font-sans text-xs text-navy-200/50 tracking-widest uppercase">
          · raffinée · authentique · guinéenne ·
        </p>
      </footer>

      {imageSelectionnee && (
        <ImageViewer
          image={imageSelectionnee.image_url}
          nom={imageSelectionnee.nom}
          onClose={() => setImageSelectionnee(null)}
        />
      )}
    </div>
  )
}
