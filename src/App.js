import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Accueil from './pages/Accueil'
import Inscription from './pages/Inscription'
import Connexion from './pages/Connexion'
import Boutique from './pages/Boutique'
import CreerBoutique from './pages/CreerBoutique'
import AjouterProduit from './pages/AjouterProduit'
import ModifierProduit from './pages/ModifierProduit'
import Feed from './pages/Feed'
import Profil from './pages/Profil'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'

function Layout() {
  const location = useLocation()
  const pagesAdmin = ['/admin', '/admin-login']
  const estAdmin = pagesAdmin.includes(location.pathname)

  return (
    <>
      {!estAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/boutique/:id" element={<Boutique />} />
        <Route path="/b/:id" element={<Boutique />} />
        <Route path="/creer-boutique" element={<CreerBoutique />} />
        <Route path="/ajouter-produit/:boutiqueId" element={<AjouterProduit />} />
        <Route path="/modifier-produit/:produitId" element={<ModifierProduit />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
