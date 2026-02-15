import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, onAuthStateChange } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging on auth initialization
        const userPromise = getCurrentUser()
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => {
            console.warn('Auth initialization timeout - proceeding without user data')
            resolve(null)
          }, 8000)
        )

        const currentUser = await Promise.race([userPromise, timeoutPromise])
        console.log('AuthContext - Current user:', currentUser)
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = onAuthStateChange((authUser) => {
      console.log('AuthContext - Auth state changed:', authUser)
      setUser(authUser)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
