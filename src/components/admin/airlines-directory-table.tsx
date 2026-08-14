"use client"

import React, { useEffect, useState } from "react"
import {
  Plane,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Globe2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export interface AirlineRecord {
  id: number
  name: string
  iata_code: string | null
  iata_prefix: string | null
  iata_accounting: string | null
  icao_code: string | null
  callsign: string | null
  country_code: string | null
  iosa_registered: number | null
  is_scheduled: number | null
  is_passenger: number | null
  is_cargo: number | null
  is_international: number | null
  total_aircrafts: number | null
  average_fleet_age: number | null
  accidents_last_5y: number | null
  crashes_last_5y: number | null
  website: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  linkedin: string | null
  slug: string | null
  created_at?: string
}

export interface AirlineStats {
  totalAirlines: number
  iataCount: number
  countriesCount: number
  lastSynced: string | null
}

export function AirlinesDirectoryTable() {
  const [airlines, setAirlines] = useState<AirlineRecord[]>([])
  const [stats, setStats] = useState<AirlineStats>({
    totalAirlines: 0,
    iataCount: 0,
    countriesCount: 0,
    lastSynced: null,
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isManualAddOpen, setIsManualAddOpen] = useState(false)
  const initialManualData = {
    name: "", iata_code: "", iata_prefix: "", iata_accounting: "", icao_code: "", callsign: "", country_code: "",
    iosa_registered: false, is_scheduled: false, is_passenger: false, is_cargo: false, is_international: false,
    total_aircrafts: "", average_fleet_age: "", accidents_last_5y: "", crashes_last_5y: "",
    website: "", facebook: "", twitter: "", instagram: "", linkedin: "", slug: ""
  }
  const [manualData, setManualData] = useState(initialManualData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClearAirlines = async () => {
    if (!confirm("Are you sure you want to clear all airline records?")) return
    setClearing(true)
    try {
      const res = await fetch("/api/admin/airlines", { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setSyncStatus({ type: "success", message: "Airlines database cleared." })
        fetchAirlines(1, "")
      }
    } finally {
      setClearing(false)
    }
  }

  const fetchAirlines = (currentPage = page, searchQuery = search) => {
    setLoading(true)
    const url = `/api/admin/airlines?page=${currentPage}&limit=20&search=${encodeURIComponent(searchQuery)}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAirlines(data.airlines || [])
          setTotalPages(data.totalPages || 1)
          setTotalRecords(data.total || 0)
          if (data.stats) {
            setStats(data.stats)
          }
        }
      })
      .catch((err) => console.error("Error fetching airlines:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAirlines(page, search)
  }, [page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchAirlines(1, search)
  }

  const handleSyncAirlines = async () => {
    setSyncing(true)
    setSyncStatus(null)

    try {
      const res = await fetch("/api/admin/airlines/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (data.success) {
        setSyncStatus({
          type: "success",
          message: data.message || `Successfully synchronized ${data.count} airlines into MariaDB database!`,
        })
        setPage(1)
        fetchAirlines(1, search)
      } else {
        setSyncStatus({
          type: "error",
          message: data.error || "Failed to synchronize airlines from AirLabs API.",
        })
      }
    } catch (err) {
      setSyncStatus({
        type: "error",
        message: "Network or database error during airline synchronization: " + (err as Error).message,
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/airlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualData)
      })
      if (res.ok) {
        setIsManualAddOpen(false)
        setManualData(initialManualData)
        fetchAirlines(1, search)
      } else {
        alert("Failed to add airline")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Sync Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[4px] border border-delta-navy/15 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] bg-delta-navy text-white">
            <Plane className="h-6 w-6 text-delta-red" />
          </div>
          <div>
            <h2 className="text-base font-[700] text-delta-navy flex items-center gap-2">
              Airlines Management & AirLabs Sync
              <Badge className="bg-delta-navy-mid text-white text-[10px] font-[600]">
                MariaDB Engine
              </Badge>
            </h2>
            <p className="text-xs text-delta-ink-muted mt-0.5">
              Synchronize global airline records from AirLabs API into MariaDB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-delta-navy/20 text-delta-navy hover:bg-delta-navy/5 font-[700] text-xs h-9 shadow-xs"
              >
                <Database className="mr-2 h-3.5 w-3.5" />
                Add Manually
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleManualAddSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Airline Manually</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new airline.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Name *</label>
                    <input required type="text" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">IATA Code</label>
                      <input type="text" value={manualData.iata_code} onChange={e => setManualData({...manualData, iata_code: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">ICAO Code</label>
                      <input type="text" value={manualData.icao_code} onChange={e => setManualData({...manualData, icao_code: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">IATA Prefix</label>
                      <input type="text" value={manualData.iata_prefix} onChange={e => setManualData({...manualData, iata_prefix: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">IATA Accounting</label>
                      <input type="text" value={manualData.iata_accounting} onChange={e => setManualData({...manualData, iata_accounting: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Callsign</label>
                      <input type="text" value={manualData.callsign} onChange={e => setManualData({...manualData, callsign: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Country Code</label>
                      <input type="text" value={manualData.country_code} onChange={e => setManualData({...manualData, country_code: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="iosa" checked={manualData.iosa_registered} onChange={e => setManualData({...manualData, iosa_registered: e.target.checked})} className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="iosa" className="text-xs font-bold uppercase tracking-wider text-delta-navy">IOSA Registered</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="sched" checked={manualData.is_scheduled} onChange={e => setManualData({...manualData, is_scheduled: e.target.checked})} className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="sched" className="text-xs font-bold uppercase tracking-wider text-delta-navy">Scheduled</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="pass" checked={manualData.is_passenger} onChange={e => setManualData({...manualData, is_passenger: e.target.checked})} className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-delta-navy">Passenger</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="cargo" checked={manualData.is_cargo} onChange={e => setManualData({...manualData, is_cargo: e.target.checked})} className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="cargo" className="text-xs font-bold uppercase tracking-wider text-delta-navy">Cargo</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="intl" checked={manualData.is_international} onChange={e => setManualData({...manualData, is_international: e.target.checked})} className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="intl" className="text-xs font-bold uppercase tracking-wider text-delta-navy">International</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Total Aircrafts</label>
                      <input type="number" value={manualData.total_aircrafts} onChange={e => setManualData({...manualData, total_aircrafts: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Avg Fleet Age</label>
                      <input type="number" step="0.1" value={manualData.average_fleet_age} onChange={e => setManualData({...manualData, average_fleet_age: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Accidents (5y)</label>
                      <input type="number" value={manualData.accidents_last_5y} onChange={e => setManualData({...manualData, accidents_last_5y: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Crashes (5y)</label>
                      <input type="number" value={manualData.crashes_last_5y} onChange={e => setManualData({...manualData, crashes_last_5y: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Slug</label>
                    <input type="text" value={manualData.slug} onChange={e => setManualData({...manualData, slug: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Website</label>
                    <input type="text" value={manualData.website} onChange={e => setManualData({...manualData, website: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Facebook</label>
                      <input type="text" value={manualData.facebook} onChange={e => setManualData({...manualData, facebook: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Twitter</label>
                      <input type="text" value={manualData.twitter} onChange={e => setManualData({...manualData, twitter: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Instagram</label>
                      <input type="text" value={manualData.instagram} onChange={e => setManualData({...manualData, instagram: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">LinkedIn</label>
                      <input type="text" value={manualData.linkedin} onChange={e => setManualData({...manualData, linkedin: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsManualAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-delta-navy text-white hover:bg-delta-navy/90">
                    {isSubmitting ? "Adding..." : "Add Airline"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            disabled={syncing || clearing}
            onClick={handleClearAirlines}
            className="border-delta-red/30 text-delta-red hover:bg-delta-red hover:text-white font-[700] text-xs h-9 shadow-xs"
          >
            {clearing ? "Clearing..." : "Clear Database"}
          </Button>

          <Button
            size="sm"
            disabled={syncing || clearing}
            onClick={handleSyncAirlines}
            className="bg-delta-red hover:bg-delta-red/90 text-white font-[700] text-xs gap-2 shrink-0 px-4 h-9 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing Airlines..." : "Sync Airlines"}</span>
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div
          className={`p-4 rounded-[4px] border flex items-start gap-3 text-xs font-[500] ${
            syncStatus.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {syncStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-[700]">{syncStatus.type === "success" ? "Sync Completed" : "Sync Failed"}</p>
            <p className="mt-0.5">{syncStatus.message}</p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Total Synced Airlines
            </CardTitle>
            <Database className="h-4 w-4 text-delta-navy" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.totalAirlines.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Stored in MariaDB database</p>
          </CardContent>
        </Card>

        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              IATA Coded Airlines
            </CardTitle>
            <Plane className="h-4 w-4 text-delta-red" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.iataCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Commercial airline codes</p>
          </CardContent>
        </Card>

        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Countries Covered
            </CardTitle>
            <Globe className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.countriesCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Global country locations</p>
          </CardContent>
        </Card>

        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Scheduled Airlines
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {airlines.filter(a => a.is_scheduled === 1).length.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Active scheduled carriers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-delta-hairline bg-white shadow-xs">
        <CardHeader className="p-4 border-b border-delta-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-[700] text-delta-navy flex items-center gap-2">
              Airlines Directory
              <Badge variant="outline" className="text-[10px] font-[600] border-delta-hairline text-delta-navy">
                {totalRecords} records
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-delta-ink-muted">
              Live airline records synchronized from AirLabs API into MariaDB.
            </CardDescription>
          </div>

          {/* Search Filter Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-delta-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, IATA, ICAO, callsign, country..."
              className="h-8.5 w-full rounded-[4px] border border-delta-hairline bg-delta-surface-1 pl-9 pr-3 text-xs text-delta-ink placeholder:text-delta-ink-muted focus:border-delta-navy focus:bg-white focus:outline-none"
            />
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-delta-surface-1">
              <TableRow className="border-b border-delta-hairline hover:bg-transparent">
                <TableHead className="w-12 text-[11px] font-[700] uppercase text-delta-navy">ID</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Airline Name</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">IATA</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">ICAO</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Callsign</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Country</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Type</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy text-right">Fleet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-delta-ink-muted">
                    Loading Airlines from MariaDB...
                  </TableCell>
                </TableRow>
              ) : airlines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-delta-ink-muted">
                    {search ? "No matching airlines found." : "No airlines synchronized yet. Click 'Sync Airlines' to load data from AirLabs API."}
                  </TableCell>
                </TableRow>
              ) : (
                airlines.map((airline) => (
                  <TableRow key={airline.id} className="border-b border-delta-hairline hover:bg-delta-surface-1/50 transition-colors">
                    <TableCell className="font-mono text-xs font-[600] text-delta-navy">
                      #{airline.id}
                    </TableCell>
                    <TableCell className="font-[600] text-xs text-delta-ink">
                      <div className="flex items-center gap-2">
                        <Plane className="h-3.5 w-3.5 text-delta-navy/40 shrink-0" />
                        <span>{airline.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {airline.iata_code ? (
                        <Badge className="bg-delta-red text-white text-[10px] font-[700] uppercase tracking-wide px-2 py-0.5">
                          {airline.iata_code}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {airline.icao_code ? (
                        <Badge variant="outline" className="font-mono text-[10px] font-[600] border-delta-navy/30 text-delta-navy">
                          {airline.icao_code}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {airline.callsign ? (
                        <Badge variant="secondary" className="bg-delta-navy/10 text-delta-navy text-[10px] font-[600] uppercase">
                          {airline.callsign}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {airline.country_code ? (
                        <Badge variant="secondary" className="bg-delta-navy-dark text-white text-[10px] font-[600]">
                          {airline.country_code}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-delta-ink">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {airline.is_scheduled === 1 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0.5">
                            <ShieldCheck className="h-2.5 w-2.5 inline mr-0.5" />
                            Scheduled
                          </Badge>
                        )}
                        {airline.is_passenger === 1 && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0.5">
                            <Plane className="h-2.5 w-2.5 inline mr-0.5" />
                            Passenger
                          </Badge>
                        )}
                        {airline.is_cargo === 1 && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0.5">
                            <Truck className="h-2.5 w-2.5 inline mr-0.5" />
                            Cargo
                          </Badge>
                        )}
                        {airline.is_international === 1 && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] px-1.5 py-0.5">
                            <Globe2 className="h-2.5 w-2.5 inline mr-0.5" />
                            Int'l
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-delta-ink-muted">
                      {airline.total_aircrafts != null && airline.total_aircrafts > 0 ? (
                        <span>{airline.total_aircrafts.toLocaleString()}</span>
                      ) : (
                        <span>N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Table Footer Pagination */}
          <div className="p-4 border-t border-delta-hairline flex flex-col sm:flex-row items-center justify-between gap-3 bg-delta-surface-1">
            <span className="text-xs text-delta-ink-muted">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} airlines total)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 border-delta-hairline text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 border-delta-hairline text-xs gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}