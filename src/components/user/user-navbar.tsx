"use client"

import React from "react"
import { LogOut, User, LayoutDashboard, ChevronDown, Bell, Wallet } from "lucide-react"

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

export function UserNavbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-delta-navy-mid bg-delta-navy text-white font-sans">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-delta-red text-white shadow-none">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-sm font-bold tracking-tight text-white select-none">
              SkyLedger
              <span className="rounded-full bg-delta-surface-2 px-2.5 py-0.5 text-[10px] font-bold text-delta-navy uppercase tracking-wider">
                Silver Medallion
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-sm p-2 text-white/80 hover:bg-delta-navy-mid/40 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-sm p-1.5 text-left transition-colors hover:bg-delta-navy-mid/40 focus:outline-none">
              <Avatar className="h-8 w-8 border border-delta-navy-mid">
                <AvatarFallback className="bg-delta-surface-2 text-[11px] font-bold text-delta-navy">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col md:flex">
                <span className="text-xs font-bold leading-tight text-white">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-[10px] text-white/70 leading-none">Silver Medallion</span>
              </div>
              <ChevronDown className="h-4 w-4 text-white/70" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-sm border border-delta-hairline bg-delta-canvas p-1 shadow-lg text-delta-ink">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-delta-navy">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-delta-ink-muted truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-delta-hairline" />
              <DropdownMenuItem 
                onClick={() => window.location.href = "/user/dashboard"}
                className="gap-2 cursor-pointer hover:bg-delta-surface-1 hover:text-delta-navy focus:bg-delta-surface-1 focus:text-delta-navy rounded-none"
              >
                <LayoutDashboard className="h-4 w-4 text-delta-ink-muted" />
                <span className="font-medium">Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.location.href = "/user/profile"}
                className="gap-2 cursor-pointer hover:bg-delta-surface-1 hover:text-delta-navy focus:bg-delta-surface-1 focus:text-delta-navy rounded-none"
              >
                <User className="h-4 w-4 text-delta-ink-muted" />
                <span className="font-medium">My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-delta-hairline" />
              <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer text-delta-red focus:text-delta-red focus:bg-delta-red/10 rounded-none">
                <LogOut className="h-4 w-4" />
                <span className="font-bold">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
