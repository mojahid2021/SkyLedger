"use client"

import React, { useState, useRef, useEffect } from "react"
import { Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { LocationResult } from "./types"

function useLocationSearch(query: string): { results: LocationResult[]; loading: boolean } {
  const [results, setResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!query || query.trim().length < 2) {
      return
    }

    timerRef.current = setTimeout(() => {
      setLoading(true)
      fetch(`/api/locations?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setResults(d.data)
        })
        .finally(() => setLoading(false))
    }, 200)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  const activeResults = !query || query.trim().length < 2 ? [] : results

  return { results: activeResults, loading }
}

export function LocationInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (val: string, code: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const { results, loading } = useLocationSearch(query)

  // Keep internal query input synchronized with incoming value prop
  useEffect(() => {
    setQuery(value)
  }, [value])

  return (
    <div className="space-y-1.5 flex-1 w-full font-delta">
      <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide block">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
          {icon}
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value, e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={`Search airport or city...`}
          className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[14px] text-delta-ink outline-none transition-all focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 placeholder-delta-ink-muted/50 font-normal"
        />
        {open && query.trim().length >= 2 && (
          <div className="absolute z-35 mt-1 max-h-72 w-full overflow-auto rounded-[4px] border border-delta-hairline bg-delta-canvas p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            {loading && (
              <p className="px-3.5 py-3 text-[13px] text-delta-ink-muted animate-pulse">
                Searching airports...
              </p>
            )}
            {!loading && results.length === 0 && (
              <p className="px-3.5 py-3 text-[13px] text-delta-ink-muted">
                No matching airports found
              </p>
            )}
            {!loading && (
              <div className="flex flex-col gap-0.5">
                {results.map((ap) => {
                  const apCode = ap.iata_code || ap.icao_code || ""
                  const displayLabel = `${ap.name}${apCode ? ` (${apCode})` : ""}${
                    ap.country_code ? ` · ${ap.country_code}` : ""
                  }`

                  return (
                    <button
                      key={`ap-${ap.id}`}
                      type="button"
                      onMouseDown={() => {
                        setQuery(displayLabel)
                        onChange(displayLabel, apCode)
                        setOpen(false)
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-delta-ink hover:bg-delta-surface-2 rounded-[3px] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Plane className="h-4 w-4 text-delta-navy shrink-0 opacity-85" />
                        <span className="truncate font-[500] text-delta-navy">
                          {ap.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {ap.iata_code && (
                          <span className="rounded bg-delta-navy px-1.5 py-0.5 font-mono text-[10px] font-[700] text-white">
                            {ap.iata_code}
                          </span>
                        )}
                        {ap.icao_code && ap.icao_code !== ap.iata_code && (
                          <span className="rounded bg-delta-navy/70 px-1.5 py-0.5 font-mono text-[10px] font-[700] text-white">
                            {ap.icao_code}
                          </span>
                        )}
                        {ap.country_code && (
                          <span className="text-[11px] font-[400] text-delta-ink-muted">
                            {ap.country_code}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
