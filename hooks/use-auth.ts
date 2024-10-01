import { useState, useEffect } from 'react'

interface User {
  image?: string;
  name?: string;
  email?: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', { credentials: 'include' })
        const data = await response.json()
        setIsAuthenticated(data.isAuthenticated)
        setUser(data.user)
      } catch (error) {
        console.error('Error checking auth status:', error)
      }
    }

    checkAuth()
  }, [])

  return { isAuthenticated, user }
}