"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconShield,
  IconShieldCheck,
  IconUsers,
  IconBuildingBank,
  IconReceipt,
  IconServer,
  IconKey,
  IconAlertTriangle,
  IconPlus,
  IconRefresh,
  IconLogout,
  IconUserCheck,
  IconTrendingUp,
  IconActivity,
  IconLock,
  IconCheck,
  IconDotsVertical,
  IconUser,
  IconBook2,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminDashboardPage() {
  const { user, role, isLoading, logout, loginAsRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (role !== "admin") {
        // Redirect standard user away from admin dashboard
        router.replace("/user/dashboard")
      }
    }
  }, [user, role, isLoading, router])

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Verifying Administrative Credentials...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navbar for Admin */}
      <header className="sticky top-0 z-40 border-b bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <IconShield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                SkyLedger Admin Console
                <Badge className="bg-indigo-600 text-white text-[11px]">
                  Super Admin
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">Full Administrative Access & System Control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch Role Button for demo convenience */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loginAsRole("user")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            >
              <IconUser className="h-3.5 w-3.5" />
              <span>Switch to User Mode</span>
            </Button>

            <div className="flex items-center gap-2 border-l pl-3">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-indigo-500/10 text-indigo-600 font-bold">AV</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Alert */}
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <IconShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                Administrator Privileges Active
                <Badge variant="outline" className="text-[10px] border-indigo-500/40">
                  Role: ADMIN
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                You have elevated permissions to configure user accounts, audit ledger logs, and manage system database clusters.
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs shrink-0">
            <IconPlus className="h-3.5 w-3.5" />
            <span>Create New User</span>
          </Button>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-indigo-600">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Active System Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">48 Members</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500 font-semibold">+4 new</span> this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Database Health & Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.99% Operational</div>
              <p className="text-xs text-muted-foreground mt-1">PostgreSQL & Mongo Synced</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Pending Ledger Audits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-amber-600">2 Items</div>
              <p className="text-xs text-muted-foreground mt-1">Requires Admin approval</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Total System Reserve
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">$4,852,910</div>
              <p className="text-xs text-muted-foreground mt-1">across 12 ledger vaults</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="users" className="gap-2 text-xs font-medium">
              <IconUsers className="h-4 w-4" />
              User Access & Roles
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 text-xs font-medium">
              <IconShieldCheck className="h-4 w-4" />
              System Audit Logs
            </TabsTrigger>
            <TabsTrigger value="nodes" className="gap-2 text-xs font-medium">
              <IconServer className="h-4 w-4" />
              Database Cluster Nodes
            </TabsTrigger>
          </TabsList>

          {/* User Access & Roles Tab */}
          <TabsContent value="users" className="m-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <IconUsers className="h-5 w-5 text-indigo-600" />
                    Directory of System Users & Assigned Roles
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage administrative privileges, role assignments, and status across the organization.
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  <IconRefresh className="h-3.5 w-3.5" />
                  Refresh Directory
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>User Profile</TableHead>
                        <TableHead>Assigned Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Account Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                              <AvatarFallback>AV</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">Alexander Vance</span>
                              <span className="text-xs text-muted-foreground font-mono">admin@skyledger.io</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-indigo-600 text-white text-xs gap-1 font-semibold">
                            <IconShield className="h-3 w-3" />
                            ADMINISTRATOR
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">Executive Administration</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-xs gap-1">
                            <IconCheck className="h-3 w-3" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-xs">Edit Role</Button>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" />
                              <AvatarFallback>SJ</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">Sarah Jenkins</span>
                              <span className="text-xs text-muted-foreground font-mono">user@skyledger.io</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs gap-1 font-semibold">
                            <IconUser className="h-3 w-3" />
                            STANDARD USER
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">Treasury Operations</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-xs gap-1">
                            <IconCheck className="h-3 w-3" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-xs">Promote to Admin</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <IconShieldCheck className="h-5 w-5 text-indigo-600" />
                  System Security & Authentication Audit Logs
                </CardTitle>
                <CardDescription className="text-xs">
                  Recorded sign-in attempts, role checks, and administrative overrides.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { event: "Admin Login Success", actor: "admin@skyledger.io", ip: "192.168.1.100", time: "Just now", status: "success" },
                  { event: "Role Verification Check", actor: "user@skyledger.io", ip: "192.168.1.104", time: "5 mins ago", status: "success" },
                  { event: "Unauthorized Admin Access Attempted", actor: "user@skyledger.io -> /admin", ip: "192.168.1.104", time: "12 mins ago", status: "blocked" },
                ].map((item, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      {item.status === "success" ? (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="font-semibold text-foreground">{item.event}</span>
                      <span className="text-muted-foreground font-mono">({item.actor})</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground font-mono">
                      <span>IP: {item.ip}</span>
                      <span>• {item.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Nodes Tab */}
          <TabsContent value="nodes" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <IconServer className="h-5 w-5 text-indigo-600" />
                  Database Cluster Health (PostgreSQL + MongoDB)
                </CardTitle>
                <CardDescription className="text-xs">
                  Dual-database architecture replication state and connection pools.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">PostgreSQL Primary Cluster</span>
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Primary Master</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Relational ledgers & transactional ACID consistency.</p>
                  <div className="text-xs font-mono pt-2 space-y-1">
                    <div>Connections: 24/100</div>
                    <div>WAL Replication Delay: 1.2ms</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">MongoDB Document Cluster</span>
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Replica Set</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Flexible audit logs, metadata & document storage.</p>
                  <div className="text-xs font-mono pt-2 space-y-1">
                    <div>Active Replicas: 3/3 Nodes</div>
                    <div>Read Preference: Secondary Preferred</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
