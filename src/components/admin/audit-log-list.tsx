"use client"

import React, { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle, ShieldX, RefreshCw, Database, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAutoPageSize } from "@/hooks/use-auto-page-size"

export interface AuditEvent {
  id?: string
  event: string
  actor: string
  ip: string
  time: string
  status: "success" | "blocked" | "warning"
}

const STATUS_META: Record<
  AuditEvent["status"],
  { label: string; icon: typeof CheckCircle2; pill: string; iconClass: string }
> = {
  success: {
    label: "SUCCESS",
    icon: CheckCircle2,
    pill: "bg-delta-success/10 text-delta-success",
    iconClass: "text-delta-success",
  },
  blocked: {
    label: "BLOCKED",
    icon: ShieldX,
    pill: "bg-delta-error/10 text-delta-error",
    iconClass: "text-delta-error",
  },
  warning: {
    label: "WARNING",
    icon: AlertTriangle,
    pill: "bg-delta-warning/10 text-delta-warning",
    iconClass: "text-delta-warning",
  },
}

/**
 * AuditLogList — Live security audit logs stored in MongoDB.
 */
export function AuditLogList() {
  const [logs, setLogs] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [manualPageSize, setManualPageSize] = useState<number | "auto">("auto")

  // Auto-detect optimal page size based on viewport height
  const autoPageSize = useAutoPageSize(56, 320, 5)
  const pageSize = manualPageSize === "auto" ? autoPageSize : manualPageSize

  const fetchLogs = () => {
    setLoading(true)
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs)
        }
      })
      .catch((err) => console.log("Failed to fetch audit logs", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const totalPages = Math.ceil(logs.length / pageSize) || 1
  const validPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, logs.length)
  const paginatedLogs = logs.slice(startIndex, endIndex)

  return (
    <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas">
      <div className="flex flex-col gap-2 border-b border-delta-hairline p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[13px] font-[700] text-delta-navy flex items-center gap-2">
            Recent Security Events
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-[600] text-emerald-600">
              <Database className="h-3 w-3" />
              MongoDB Live
            </span>
          </h3>
          <p className="text-xs text-delta-ink-muted">
            Live sign-in attempts, access checks, and system events stored in MongoDB.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchLogs}
          disabled={loading}
          className="h-8 gap-1.5 rounded-[4px] border-delta-hairline text-xs text-delta-navy hover:bg-delta-surface-1 shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh Logs
        </Button>
      </div>

      <ul className="divide-y divide-delta-hairline-light">
        {loading && logs.length === 0 ? (
          <li className="px-4 py-8 text-center text-xs text-delta-ink-muted">
            Loading security logs from MongoDB...
          </li>
        ) : logs.length === 0 ? (
          <li className="px-4 py-8 text-center text-xs text-delta-ink-muted">
            No security audit events recorded.
          </li>
        ) : (
          paginatedLogs.map((item, index) => {
            const meta = STATUS_META[item.status] || STATUS_META.success
            const Icon = meta.icon
            return (
              <li
                key={item.id || index}
                className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-delta-surface-1/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.iconClass)} />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-[600] text-delta-ink">{item.event}</p>
                    <p className="truncate font-mono text-xs text-delta-ink-muted">{item.actor}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pl-7 sm:pl-0">
                  <span className="font-mono text-xs text-delta-ink-muted">IP: {item.ip}</span>
                  <span className="text-xs text-delta-ink-muted">· {item.time}</span>
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-[600]",
                      meta.pill
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
              </li>
            )
          })
        )}
      </ul>

      {/* Standardized Pagination Footer */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-delta-hairline bg-delta-surface-1 px-4 py-3 text-xs text-delta-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              Showing <span className="font-[600] text-delta-ink">{startIndex + 1}</span> to{" "}
              <span className="font-[600] text-delta-ink">{endIndex}</span> of{" "}
              <span className="font-[600] text-delta-ink">{logs.length}</span> security events
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Rows:</span>
              <select
                value={manualPageSize}
                onChange={(e) => {
                  const val = e.target.value
                  setManualPageSize(val === "auto" ? "auto" : Number(val))
                  setCurrentPage(1)
                }}
                className="h-7 rounded-[4px] border border-delta-hairline bg-delta-canvas px-2 text-xs font-[600] text-delta-ink focus:border-delta-navy focus:outline-none"
              >
                <option value="auto">Auto ({autoPageSize})</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={validPage <= 1}
              className="h-7 gap-1 rounded-[4px] border-delta-hairline px-2 text-xs font-[500]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-[4px] border text-xs font-[600] transition-colors",
                  page === validPage
                    ? "border-delta-navy bg-delta-navy text-white"
                    : "border-delta-hairline bg-delta-canvas text-delta-ink hover:bg-delta-surface-2"
                )}
              >
                {page}
              </button>
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={validPage >= totalPages}
              className="h-7 gap-1 rounded-[4px] border-delta-hairline px-2 text-xs font-[500]"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
