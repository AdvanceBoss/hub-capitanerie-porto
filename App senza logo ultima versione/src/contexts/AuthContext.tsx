import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  canAccess: (requiredRole: string) => boolean
  canViewOrganization: (organizationId: string) => boolean
  getSubOrganizations: () => Organization[]
}

interface Organization {
  id: string
  nome: string
  tipo: string
  codice: string
  parent_id?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error

      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Errore nel caricamento del profilo utente')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Accesso effettuato con successo')
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Errore durante l\'accesso')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSupabaseUser(null)
      toast.success('Disconnessione effettuata')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Errore durante la disconnessione')
    }
  }

  // Check if user can access a specific role level
  const canAccess = (requiredRole: string): boolean => {
    if (!user) return false

    const roleHierarchy = {
      'maricogecap': 4,
      'direzione_marittima': 3,
      'capitaneria': 2,
      'ufficio_circondariale': 1
    }

    const userLevel = roleHierarchy[user.ruolo as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }

  // Check if user can view a specific organization
  const canViewOrganization = (organizationId: string): boolean => {
    if (!user) return false

    // MARICOGECAP can view everything
    if (user.ruolo === 'maricogecap') return true

    // Check if organization is under user's hierarchy
    return user.organization_id === organizationId
  }

  // Get sub-organizations that user can manage
  const getSubOrganizations = (): Organization[] => {
    if (!user) return []

    // This would need to be implemented with a recursive query
    // For now, return empty array - will be implemented in the dashboard
    return []
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signOut,
    canAccess,
    canViewOrganization,
    getSubOrganizations
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
