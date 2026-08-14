"use client"

import React, { useEffect, useRef } from "react"
import {
  Plane,
  LogOut,
  Search,
  Bell,
  User,
  Shield,
  ChevronDown,
  Settings,
} from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminNavbarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

/**
 * AdminNavbar — minimal, modern, theme-matched header with profile menu.
 */
export function AdminNavbar({ searchQuery = "", onSearchChange }: AdminNavbarProps) {
  const { user, logout } = useAuth()
  const searchRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K focuses the global search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <header className="z-40 shrink-0 bg-delta-navy text-white">
      {/* 2px brand accent line */}
      <div className="h-0.5 bg-delta-red" />

      <div className="flex h-14 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6 lg:px-8">
        {/* Brand lockup */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-white text-delta-navy shadow-xs">
            <Plane className="h-4 w-4 text-delta-navy" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-[15px] font-[700] leading-tight tracking-tight text-white">
              SkyLedger
            </h1>
            <Badge className="rounded-full bg-delta-red/90 px-2 py-0.5 text-[10px] font-[700] uppercase tracking-wider text-white">
              Admin
            </Badge>
          </div>
        </div>

        {/* Center: Minimal Global Search */}
        <div className="relative hidden max-w-md flex-1 lg:block mx-4">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search users, audit logs..."
            className="h-8.5 w-full rounded-[4px] border border-white/15 bg-white/5 pl-9 pr-12 text-xs text-white placeholder:text-white/40 transition-colors focus:border-delta-red focus:bg-white/10 focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 flex h-4.5 -translate-y-1/2 items-center rounded-[3px] border border-white/15 bg-white/10 px-1.5 text-[10px] font-[600] text-white/50">
            ⌘K
          </kbd>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            type="button"
            title="Notifications"
            className="relative rounded-[4px] p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-delta-red ring-2 ring-delta-navy" />
          </button>

          {/* Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-[4px] p-1.5 text-left transition-colors hover:bg-white/10 focus:outline-none">
              <Avatar className="h-7 w-7 border border-white/30">
                <AvatarFallback className="bg-white/15 text-[11px] font-[700] text-white">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col md:flex">
                <span className="text-xs font-[600] leading-tight text-white">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-[10px] text-white/50 leading-none">Super Admin</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/60" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 rounded-[4px] border border-delta-hairline bg-delta-canvas p-1 text-delta-ink shadow-lg"
            >
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-delta-hairline">
                    <AvatarFallback className="bg-delta-navy text-xs font-[700] text-white">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-[700] text-delta-navy">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="truncate font-mono text-[11px] text-delta-ink-muted">
                      {user?.email}
                    </span>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-delta-red px-2 py-0.5 text-[9px] font-[700] uppercase tracking-wider text-white">
                        Super Admin
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-delta-hairline-light" />

              <DropdownMenuItem 
                onClick={() => window.location.href = "/admin/profile"}
                className="flex cursor-pointer items-center gap-2 rounded-[3px] px-3 py-2 text-xs font-[500] text-delta-ink hover:bg-delta-surface-1 focus:bg-delta-surface-1 focus:text-delta-navy"
              >
                <User className="h-3.5 w-3.5 text-delta-navy" />
                <span>Profile Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-[3px] px-3 py-2 text-xs font-[500] text-delta-ink hover:bg-delta-surface-1 focus:bg-delta-surface-1 focus:text-delta-navy">
                <Shield className="h-3.5 w-3.5 text-delta-navy" />
                <span>Security & Roles</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-[3px] px-3 py-2 text-xs font-[500] text-delta-ink hover:bg-delta-surface-1 focus:bg-delta-surface-1 focus:text-delta-navy">
                <Settings className="h-3.5 w-3.5 text-delta-navy" />
                <span>System Preferences</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-delta-hairline-light" />

              <DropdownMenuItem
                onClick={logout}
                className="flex cursor-pointer items-center gap-2 rounded-[3px] px-3 py-2 text-xs font-[600] text-delta-red hover:bg-delta-red/10 focus:bg-delta-red/10 focus:text-delta-red"
              >
                <LogOut className="h-3.5 w-3.5 text-delta-red" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
