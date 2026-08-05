"use client"

import React from "react"
import {
  IconBuildingBank,
  IconSearch,
  IconBell,
  IconPlus,
  IconUser,
  IconSettings,
  IconLogout,
  IconShield,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"

interface NavbarProps {
  onNewTransaction?: () => void
}

export function Navbar({ onNewTransaction }: NavbarProps) {
  const { user, logout } = useAuth()
  const [dark, setDark] = React.useState(false)

  const toggleTheme = () => {
    setDark(!dark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <IconBuildingBank className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              SkyLedger
              <Badge variant="secondary" className="text-xs font-normal">
                Enterprise
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">Modern Accounting & Ledger System</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ledgers, transactions, accounts, invoices..."
              className="pl-9 pr-4 h-9 w-full bg-muted/40 border-muted focus-visible:bg-background"
            />
          </div>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={onNewTransaction}
            className="hidden sm:inline-flex items-center gap-1.5 font-medium"
          >
            <IconPlus className="h-4 w-4" />
            <span>New Transaction</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {dark ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <IconBell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? `${user.first_name} ${user.last_name}` : "Member Name"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "member@skyledger.io"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <IconShield className="h-4 w-4 text-muted-foreground" />
                <span>Security & Permissions</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <IconSettings className="h-4 w-4 text-muted-foreground" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive gap-2" onClick={logout}>
                <IconLogout className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
