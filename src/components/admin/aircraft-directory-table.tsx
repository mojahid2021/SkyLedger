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
  Wrench,
  Factory,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface AircraftRecord {
  id: number
  hex: string | null
  reg_number: string | null
  flag: string | null
  airline_icao: string | null
  airline_iata: string | null
  seen: number | null
  icao: string | null
  iata: string | null
  model: string | null
  engine: string | null
  engine_count: string | null
  manufacturer: string | null
  type: string | null
  category: string | null
  built: number | null
  age: number | null
  msn: string | null
  line: string | null
  lat: number | null
  lng: number | null
  alt: number | null
  dir: number | null
  speed: number | null
  v_speed: number | null
  squawk: string | null
  last_seen: string | null
  created_at?: string
}

export interface AircraftStats {
  totalAircraft: number
  airlinesCount: number
  manufacturersCount: number
  countriesCount: number
  lastSynced: string | null
}

export function AircraftDirectoryTable() {
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [stats, setStats] = useState<AircraftStats>({
    totalAircraft: 0,
    airlinesCount: 0,
    manufacturersCount: 0,
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

  const handleClearAircraft = async () => {
    if (!confirm("Are you sure you want to clear all aircraft fleet records?")) return
    setClearing(true)
    try {
      const res = await fetch("/api/admin/fleets", { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setSyncStatus({ type: "success", message: "Aircraft fleet database cleared." })
        fetchAircraft(1, "")
      }
    } finally {
      setClearing(false)
    }
  }

  const fetchAircraft = (currentPage = page, searchQuery = search) => {
    setLoading(true)
    const url = `/api/admin/fleets?page=${currentPage}&limit=20&search=${encodeURIComponent(searchQuery)}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAircraft(data.aircraft || [])
          setTotalPages(data.totalPages || 1)
          setTotalRecords(data.total || 0)
          if (data.stats) {
            setStats(data.stats)
          }
        }
      })
      .catch((err) => console.error("Error fetching aircraft:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAircraft(page, search)
  }, [page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchAircraft(1, search)
  }

  const handleSyncAircraft = async () => {
    setSyncing(true)
    setSyncStatus(null)

    try {
      const res = await fetch("/api/admin/fleets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (data.success) {
        setSyncStatus({
          type: "success",
          message: data.message || `Successfully synchronized ${data.count} aircraft into MariaDB database!`,
        })
        setPage(1)
        fetchAircraft(1, search)
      } else {
        setSyncStatus({
          type: "error",
          message: data.error || "Failed to synchronize aircraft fleet from AirLabs API.",
        })
      }
    } catch (err) {
      setSyncStatus({
        type: "error",
        message: "Network or database error during fleet synchronization: " + (err as Error).message,
      })
    } finally {
      setSyncing(false)
    }
  }

  /** Category label mapping */
  const getCategoryLabel = (cat: string | null) => {
    if (!cat) return "—"
    const map: Record<string, string> = {
      J: "Super",
      H: "Heavy",
      M: "Medium",
      L: "Light",
      "L/M": "Light/Medium",
    }
    return map[cat] || cat
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
              Aircraft Fleet Management & AirLabs Sync
              <Badge className="bg-delta-navy-mid text-white text-[10px] font-[600]">
                MariaDB Engine
              </Badge>
            </h2>
            <p className="text-xs text-delta-ink-muted mt-0.5">
              Synchronize global aircraft fleet records from AirLabs API into MariaDB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            disabled={syncing || clearing}
            onClick={handleClearAircraft}
            className="border-delta-red/30 text-delta-red hover:bg-delta-red hover:text-white font-[700] text-xs h-9 shadow-xs"
          >
            {clearing ? "Clearing..." : "Clear Database"}
          </Button>

          <Button
            size="sm"
            disabled={syncing || clearing}
            onClick={handleSyncAircraft}
            className="bg-delta-red hover:bg-delta-red/90 text-white font-[700] text-xs gap-2 shrink-0 px-4 h-9 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing Fleet..." : "Sync Fleet"}</span>
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
              Total Aircraft
            </CardTitle>
            <Database className="h-4 w-4 text-delta-navy" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.totalAircraft.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Stored in MariaDB database</p>
          </CardContent>
        </Card>

        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Airlines Covered
            </CardTitle>
            <Building2 className="h-4 w-4 text-delta-red" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.airlinesCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Distinct airline operators</p>
          </CardContent>
        </Card>

        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Manufacturers
            </CardTitle>
            <Factory className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.manufacturersCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Boeing, Airbus, Embraer, etc.</p>
          </CardContent>
        </Card>

        <Card className="border-delta-hairline bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-[600] text-delta-ink-muted uppercase tracking-wider">
              Countries
            </CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-[700] text-delta-navy">
              {stats.countriesCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-delta-ink-muted mt-0.5">Global aircraft registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-delta-hairline bg-white shadow-xs">
        <CardHeader className="p-4 border-b border-delta-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-[700] text-delta-navy flex items-center gap-2">
              Aircraft Fleet Directory
              <Badge variant="outline" className="text-[10px] font-[600] border-delta-hairline text-delta-navy">
                {totalRecords} records
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-delta-ink-muted">
              Live aircraft fleet records synchronized from AirLabs API into MariaDB.
            </CardDescription>
          </div>

          {/* Search Filter Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-delta-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by reg, model, manufacturer, airline..."
              className="h-8.5 w-full rounded-[4px] border border-delta-hairline bg-delta-surface-1 pl-9 pr-3 text-xs text-delta-ink placeholder:text-delta-ink-muted focus:border-delta-navy focus:bg-white focus:outline-none"
            />
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-delta-surface-1">
              <TableRow className="border-b border-delta-hairline hover:bg-transparent">
                <TableHead className="w-12 text-[11px] font-[700] uppercase text-delta-navy">ID</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Reg Number</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">ICAO24 Hex</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Model</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Manufacturer</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Airline</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Type</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Category</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Engine</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy text-right">Built</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy text-right">Age</TableHead>
                <TableHead className="text-[11px] font-[700] uppercase text-delta-navy">Flag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-xs text-delta-ink-muted">
                    Loading Aircraft Fleet from MariaDB...
                  </TableCell>
                </TableRow>
              ) : aircraft.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-xs text-delta-ink-muted">
                    {search
                      ? "No matching aircraft found."
                      : "No aircraft synchronized yet. Click 'Sync Fleet' to load data from AirLabs API."}
                  </TableCell>
                </TableRow>
              ) : (
                aircraft.map((ac) => (
                  <TableRow
                    key={ac.id}
                    className="border-b border-delta-hairline hover:bg-delta-surface-1/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-[600] text-delta-navy">
                      #{ac.id}
                    </TableCell>
                    <TableCell className="font-[600] text-xs text-delta-ink">
                      <div className="flex items-center gap-2">
                        <Plane className="h-3.5 w-3.5 text-delta-navy/40 shrink-0" />
                        <span>{ac.reg_number || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ac.hex ? (
                        <Badge variant="outline" className="font-mono text-[10px] font-[600] border-delta-navy/30 text-delta-navy">
                          {ac.hex}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-delta-ink max-w-[180px] truncate" title={ac.model || undefined}>
                      {ac.model || "—"}
                    </TableCell>
                    <TableCell>
                      {ac.manufacturer ? (
                        <Badge className="bg-delta-navy-mid text-white text-[10px] font-[600] uppercase">
                          {ac.manufacturer}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {ac.airline_iata ? (
                          <Badge className="bg-delta-red text-white text-[10px] font-[700] uppercase tracking-wide px-2 py-0.5">
                            {ac.airline_iata}
                          </Badge>
                        ) : null}
                        {ac.airline_icao ? (
                          <Badge variant="outline" className="font-mono text-[10px] font-[600] border-delta-navy/30 text-delta-navy">
                            {ac.airline_icao}
                          </Badge>
                        ) : null}
                        {!ac.airline_iata && !ac.airline_icao && (
                          <span className="text-[11px] text-delta-ink-muted">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ac.type ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0.5 capitalize">
                          {ac.type}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ac.category ? (
                        <Badge variant="secondary" className="bg-delta-navy/10 text-delta-navy text-[10px] font-[600]">
                          {ac.category} · {getCategoryLabel(ac.category)}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-delta-ink">
                      <div className="flex items-center gap-1">
                        {ac.engine ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0.5 capitalize">
                            <Wrench className="h-2.5 w-2.5 inline mr-0.5" />
                            {ac.engine}
                            {ac.engine_count ? ` ×${ac.engine_count}` : ""}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-delta-ink-muted">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-delta-ink-muted">
                      {ac.built || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-delta-ink-muted">
                      {ac.age != null ? `${ac.age}y` : "—"}
                    </TableCell>
                    <TableCell>
                      {ac.flag ? (
                        <Badge variant="secondary" className="bg-delta-navy-dark text-white text-[10px] font-[600]">
                          {ac.flag}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-delta-ink-muted">—</span>
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
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} aircraft total)
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
