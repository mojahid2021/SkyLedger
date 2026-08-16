"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "admin" | "user"

export interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  role: UserRole
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  phone?: string
  date_of_birth?: string
}

interface AuthContextType {
  user: UserProfile | null
  role: UserRole | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
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
        if (parsed && parsed.email) {
          setUser(parsed)
        }
      } catch (e) {
        console.error("Failed to restore session", e)
      }
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success && data.user) {
        setUser(data.user)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))

        if (data.user.role === "admin") {
          router.push("/admin/overview")
        } else {
          router.push("/user/dashboard")
        }
        return { success: true }
      } else {
        return { success: false, error: data.error || "Authentication failed" }
      }
    } catch (err) {
      return { success: false, error: "Network error or database unreachable" }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
        router.push("/user/dashboard")
        return { success: true }
      } else {
        return { success: false, error: result.error || "Registration failed" }
      }
    } catch (err) {
      return { success: false, error: "Network error during registration" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        register,
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
