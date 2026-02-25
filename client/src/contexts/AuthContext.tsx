"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type AuthState = {
  loading: boolean
  user: { id: string; email: string; username?: string } | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthState['user']>(null)

  const refresh = async () => {
    try {
      const res = await fetch('/api/v1/profile', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setUser({ id: json.id, email: json.email, username: json.username })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await fetch('/api/v1/auth/signout', { method: 'POST' })
    await refresh()
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <Ctx.Provider value={{ loading, user, refresh, signOut }}>{children}</Ctx.Provider>
  )
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

