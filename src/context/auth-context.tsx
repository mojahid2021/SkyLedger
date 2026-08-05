"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "admin" | "user"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  title: string
  department: string
}

export const MOCK_USERS: Record<string, UserProfile & { passwordHash: string }> = {
  "admin@skyledger.io": {
    id: "usr-admin-01",
    name: "Alexander Vance",
    email: "admin@skyledger.io",
    passwordHash: "admin123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    title: "Chief Risk & Ledger Officer",
    department: "Executive Administration",
  },
  "user@skyledger.io": {
    id: "usr-user-02",
    name: "Sarah Jenkins",
    email: "user@skyledger.io",
    passwordHash: "user123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "Senior Financial Analyst",
    department: "Treasury Operations",
  },
}

interface AuthContextType {
  user: UserProfile | null
  role: UserRole | null
  isLoading: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  loginAsRole: (targetRole: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "skyledger_user_session"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && MOCK_USERS[parsed.email]) {
          setUser(MOCK_USERS[parsed.email])
        }
      } catch (e) {
        console.error("Failed to restore session", e)
      }
    } else {
      // Default to null if no session
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const account = MOCK_USERS[email.toLowerCase().trim()]
    if (!account) {
      return { success: false, error: "Invalid email or password" }
    }

    if (account.passwordHash !== password) {
      return { success: false, error: "Invalid email or password" }
    }

    const { passwordHash, ...userObj } = account
    setUser(userObj)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj))

    // Automatically route to dedicated dashboard based on role
    if (userObj.role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/user/dashboard")
    }

    return { success: true }
  }

  const loginAsRole = (targetRole: UserRole) => {
    const targetEmail = targetRole === "admin" ? "admin@skyledger.io" : "user@skyledger.io"
    const targetUser = MOCK_USERS[targetEmail]
    if (targetUser) {
      const { passwordHash, ...userObj } = targetUser
      setUser(userObj)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj))

      if (targetRole === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        loginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
