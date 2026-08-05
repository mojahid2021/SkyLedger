"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, RefreshCw, Shield, User as UserIcon, UserCog, ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAutoPageSize } from "@/hooks/use-auto-page-size"

export interface AdminUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  role: "admin" | "user"
  created_at?: string
}

interface UserDirectoryTableProps {
  users: AdminUser[]
  loading: boolean
  onRefresh: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

/**
 * UserDirectoryTable — Delta styling throughout:
 * hairline table grid, uppercase micro-label column heads on surface-1,
 * mono identifiers, and pill (medallion-style) role badges.
 * Red is reserved for the per-section manage action row button.
 */
export function UserDirectoryTable({
  users,
  loading,
  onRefresh,
  searchQuery: externalQuery,
  onSearchChange: externalOnSearchChange,
}: UserDirectoryTableProps) {
  const router = useRouter()
  const [internalQuery, setInternalQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [manualPageSize, setManualPageSize] = useState<number | "auto">("auto")

  // Auto-detect optimal page size based on viewport height
  const autoPageSize = useAutoPageSize(56, 320, 5)
  const pageSize = manualPageSize === "auto" ? autoPageSize : manualPageSize

  const query = externalQuery !== undefined ? externalQuery : internalQuery
  const setQuery = (q: string) => {
    setCurrentPage(1)
    if (externalOnSearchChange) externalOnSearchChange(q)
    else setInternalQuery(q)
  }

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const validPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filtered.length)
  const paginatedUsers = filtered.slice(startIndex, endIndex)

  return (
    <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas">
      {/* Card header — search + add user + refresh */}
      <div className="flex flex-col gap-3 border-b border-delta-hairline p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-delta-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-xs text-delta-ink placeholder:text-delta-ink-muted focus:border-delta-navy focus:outline-none focus:ring-1 focus:ring-delta-navy"
          />
        </div>
        <div className="flex items-center justify-between gap-2.5 sm:justify-end">
          <span className="text-xs font-[500] text-delta-ink-muted hidden md:inline">
            {loading ? "Syncing directory..." : `${filtered.length} of ${users.length} registered users`}
          </span>

          <Button
            size="sm"
            onClick={() => router.push("/admin/users/create")}
            className="h-8 gap-1.5 rounded-[4px] bg-delta-red px-3 text-xs font-[700] text-white hover:bg-delta-red-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New User</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 gap-1.5 rounded-[4px] border-delta-hairline text-xs font-[600] text-delta-navy hover:bg-delta-surface-1"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-delta-hairline bg-delta-surface-1">
              {["ID", "User Name & Email", "Phone Number", "Date of Birth", "Assigned Role", ""].map(
                (head, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-4 py-2.5 text-[11px] font-[600] uppercase tracking-wider text-delta-ink-muted",
                      i === 5 && "text-right"
                    )}
                  >
                    {head}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-delta-hairline-light">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-delta-ink-muted">
                  {loading
                    ? "Loading user directory from database..."
                    : "No users match the current search."}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const isAdmin = u.role === "admin"
                return (
                  <tr key={u.id} className="transition-colors hover:bg-delta-surface-1/60">
                    <td className="px-4 py-3 font-mono text-xs font-[700] text-delta-navy">
                      #{u.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-[600] text-delta-ink">
                          {u.first_name} {u.last_name}
                        </span>
                        <span className="font-mono text-xs text-delta-ink-muted">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-delta-ink-muted">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-delta-ink-muted">
                      {u.date_of_birth || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {/* Medallion-style pill badges — DESIGN.md rounded.full */}
                      <span
                        className={cn(
                          "inline-flex h-5 items-center gap-1 rounded-full px-2.5 text-[11px] font-[600]",
                          isAdmin
                            ? "bg-delta-navy-mid text-white"
                            : "bg-delta-surface-2 text-delta-navy"
                        )}
                      >
                        {isAdmin ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {isAdmin ? "ADMINISTRATOR" : "STANDARD USER"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/users/${u.id}`)}
                        className="h-8 gap-1.5 rounded-[4px] px-2.5 text-xs font-[600] text-delta-red hover:bg-delta-red/5 hover:text-delta-red-hover"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        Manage / Edit
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standardized Pagination Footer */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-delta-hairline bg-delta-surface-1 px-4 py-3 text-xs text-delta-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              Showing <span className="font-[600] text-delta-ink">{startIndex + 1}</span> to{" "}
              <span className="font-[600] text-delta-ink">{endIndex}</span> of{" "}
              <span className="font-[600] text-delta-ink">{filtered.length}</span> results
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
