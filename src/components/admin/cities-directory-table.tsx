"use client"

import React, { useEffect, useState } from "react"
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function CitiesDirectoryTable() {
  const [cities, setCities] = useState<any[]>([])
  const [stats, setStats] = useState({ totalCities: 0, countriesCount: 0 })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const [isManualAddOpen, setIsManualAddOpen] = useState(false)
  const [manualData, setManualData] = useState({
    name: "",
    city_code: "",
    country_code: "",
    lat: "",
    lng: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCities = (currentPage = page, searchQuery = search) => {
    setLoading(true)
    fetch(`/api/admin/cities?page=${currentPage}&limit=20&search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCities(data.cities)
          setStats(data.stats)
          setTotalPages(data.totalPages)
          setTotalRecords(data.total)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCities(page, search)
  }, [page])

  const handleSync = async () => {
    setSyncing(true)
    setSyncStatus(null)
    try {
      const res = await fetch("/api/admin/cities/sync", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setSyncStatus({ type: "success", message: data.message })
        fetchCities(1, search)
      } else {
        setSyncStatus({ type: "error", message: data.error })
      }
    } finally {
      setSyncing(false)
    }
  }

  const handleClear = async () => {
    if (!confirm("Are you sure?")) return
    setClearing(true)
    try {
      const res = await fetch("/api/admin/cities", { method: "DELETE" })
      if (res.ok) {
        setSyncStatus({ type: "success", message: "Database cleared." })
        fetchCities(1, "")
      }
    } finally {
      setClearing(false)
    }
  }

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualData)
      })
      if (res.ok) {
        setIsManualAddOpen(false)
        setManualData({ name: "", city_code: "", country_code: "", lat: "", lng: "" })
        fetchCities(1, search)
      } else {
        alert("Failed to add city")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
            Content Management
          </span>
          <h1 className="text-xl font-[700] tracking-tight text-delta-navy sm:text-2xl flex items-center gap-2">
            Cities Directory & Sync
          </h1>
          <p className="text-xs text-delta-ink-muted">
            Manage global cities database and synchronize data from AirLabs API into MariaDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
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
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleManualAddSubmit}>
                <DialogHeader>
                  <DialogTitle>Add City Manually</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new city.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Name *</label>
                    <input required type="text" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">City Code</label>
                      <input type="text" value={manualData.city_code} onChange={e => setManualData({...manualData, city_code: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Country Code</label>
                      <input type="text" value={manualData.country_code} onChange={e => setManualData({...manualData, country_code: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Latitude</label>
                      <input type="number" step="any" value={manualData.lat} onChange={e => setManualData({...manualData, lat: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-delta-navy">Longitude</label>
                      <input type="number" step="any" value={manualData.lng} onChange={e => setManualData({...manualData, lng: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsManualAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-delta-navy text-white hover:bg-delta-navy/90">
                    {isSubmitting ? "Adding..." : "Add City"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            disabled={syncing || clearing}
            onClick={handleClear}
            className="border-delta-red/30 text-delta-red hover:bg-delta-red hover:text-white font-[700] text-xs h-9 shadow-xs"
          >
            {clearing ? "Clearing..." : "Clear Database"}
          </Button>

          <Button
            size="sm"
            disabled={syncing || clearing}
            onClick={handleSync}
            className="bg-delta-red hover:bg-delta-red/90 text-white font-[700] text-xs gap-2 shrink-0 px-4 h-9 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing Cities..." : "Sync Cities"}</span>
          </Button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Total Synced Cities
            </CardTitle>
            <Database className="h-4 w-4 text-delta-navy" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.totalCities.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Stored in MariaDB database</p>
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
      </div>

      {/* Main Table Card */}
      <Card className="border-delta-hairline bg-white shadow-xs">
        <CardHeader className="p-4 border-b border-delta-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-[700] text-delta-navy flex items-center gap-2">
              Cities Directory
              <Badge variant="outline" className="text-[10px] font-[600] border-delta-hairline text-delta-navy">
                {totalRecords} records
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-delta-ink-muted">
              Live city records synchronized from AirLabs API into MariaDB.
            </CardDescription>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchCities(1, search); }} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-delta-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, code, country..."
              className="h-8.5 w-full rounded-[4px] border border-delta-hairline bg-delta-surface-1 pl-9 pr-3 text-xs text-delta-ink placeholder:text-delta-ink-muted focus:border-delta-navy focus:bg-white focus:outline-none"
            />
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-delta-surface-1">
              <TableRow className="border-b border-delta-hairline hover:bg-transparent">
                <TableHead className="w-12 text-[11px] font-[700] uppercase text-delta-navy">ID</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">City Name</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">City Code</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Country</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy text-right">Coordinates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-delta-ink-muted">
                    Loading Cities from MariaDB...
                  </TableCell>
                </TableRow>
              ) : cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-delta-ink-muted">
                    {search ? "No matching cities found." : "No cities synchronized yet. Click 'Sync Cities' to load data."}
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((city) => (
                  <TableRow key={city.id} className="border-b border-delta-hairline hover:bg-delta-surface-1/50 transition-colors">
                    <TableCell className="font-mono text-xs font-[600] text-delta-navy">#{city.id}</TableCell>
                    <TableCell className="font-[600] text-xs text-delta-ink">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-delta-navy/40 shrink-0" />
                        <span>{city.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {city.city_code ? (
                        <Badge className="bg-delta-red text-white text-[10px] font-[700] uppercase tracking-wide px-2 py-0.5">
                          {city.city_code}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {city.country_code ? (
                        <Badge variant="secondary" className="bg-delta-navy-dark text-white text-[10px] font-[600]">
                          {city.country_code}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-delta-ink-muted">
                      {city.lat != null && city.lng != null ? (
                        <span>{Number(city.lat).toFixed(4)}, {Number(city.lng).toFixed(4)}</span>
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
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} cities total)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 border-delta-hairline text-xs gap-1">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-8 border-delta-hairline text-xs gap-1">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
