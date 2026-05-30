import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [boutique, setBoutique] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', userId).maybeSingle()
      setProfile(data)
    } catch (e) {
      console.error('Profile fetch error:', e)
    }
  }, [])

  const fetchBoutique = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('boutiques').select('*').eq('vendeur_id', userId).maybeSingle()
      setBoutique(data)
    } catch (e) {
      console.error('Boutique fetch error:', e)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
          await fetchBoutique(session.user.id)
        }
      } catch (e) {
        console.error('Auth init error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
            await fetchBoutique(session.user.id)
          }
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setBoutique(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, fetchBoutique])

  const refreshBoutique = useCallback(async () => {
    if (user) await fetchBoutique(user.id)
  }, [user, fetchBoutique])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
          <p className="font-display italic text-gold-300/80 text-lg">ShopGN</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, profile, boutique, loading, refreshBoutique }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
