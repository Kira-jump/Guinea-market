import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function CarouselProduits({ produits }) {
  const navigate = useNavigate()
  const trackRef = useRef(null)

  const items = [...produits, ...produits, ...produits]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationId
    let position = 0
    const speed = 0.5

    const animate = () => {
      position += speed
      const singleWidth = track.scrollWidth / 3
      if (position >= singleWidth) position = 0
      track.style.transform = `translateX(-${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [produits])

  if (produits.length === 0) return null

  return (
    <div className="w-full overflow-hidden bg-navy-900/60 py-5 border-y border-gold-500/10">
      <div
        ref={trackRef}
        className="flex gap-4 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {items.map((produit, index) => (
          <div
            key={`${produit.id}-${index}`}
            onClick={() => navigate(`/boutique/${produit.boutiques?.id}`)}
            className="flex-shrink-0 w-36 sm:w-44 cursor-pointer group"
          >
            <div
              className="relative overflow-hidden rounded-2xl bg-navy-800 border border-navy-700 group-hover:border-gold-500/50 group-hover:shadow-gold-glow transition-all duration-300"
              style={{ paddingBottom: '100%' }}
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
                    <span className="text-4xl">📦</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent p-2.5">
                <p className="text-gold-300 font-display text-sm font-semibold tracking-wide">
                  {produit.prix.toLocaleString()} GNF
                </p>
              </div>
            </div>
            <p className="text-xs text-navy-100/70 mt-2 line-clamp-1 px-1 font-sans">
              {produit.nom}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
