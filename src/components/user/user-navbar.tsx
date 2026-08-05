"use client"

import React from "react"
import { LogOut, User, LayoutDashboard, Receipt, ChevronDown, Bell, Wallet } from "lucide-react"

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
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-sm font-bold tracking-tight">
              SkyLedger
              <Badge variant="secondary" className="rounded-full bg-emerald-600/10 text-[10px] font-semibold text-emerald-700">
                Member
              </Badge>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-muted focus:outline-none">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-emerald-600/10 text-[11px] font-bold text-emerald-700">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col md:flex">
                <span className="text-xs font-semibold leading-tight">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">Standard Member</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl border p-1 shadow-lg">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
