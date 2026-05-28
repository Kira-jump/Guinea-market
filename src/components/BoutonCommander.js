import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BoutonCommander({ whatsapp, nomProduit, prix }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (!user) {
      navigate('/inscription')
      return
    }
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par: ${nomProduit} à ${prix.toLocaleString()} GNF`
    )
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="btn-emerald block w-full text-xs text-center py-2.5 rounded-lg font-sans"
    >
      Commander
    </button>
  )
}
