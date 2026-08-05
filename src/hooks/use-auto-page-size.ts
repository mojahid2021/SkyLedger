"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook to automatically calculate the optimal items per page
 * based on the window / container height so tables fill the layout cleanly.
 *
 * @param rowHeight Height of a single row/item in pixels (default: 54px)
 * @param reservedHeight Total pixel height of headers, search bars, navs, footers (default: 300px)
 * @param minSize Minimum page size floor (default: 4)
 */
export function useAutoPageSize(
  rowHeight = 54,
  reservedHeight = 300,
  minSize = 4
): number {
  const [pageSize, setPageSize] = useState<number>(minSize)

  useEffect(() => {
    const calculatePageSize = () => {
      if (typeof window === "undefined") return
      const available = window.innerHeight - reservedHeight
      const computed = Math.max(minSize, Math.floor(available / rowHeight))
      setPageSize(computed)
    }

    calculatePageSize()
    window.addEventListener("resize", calculatePageSize)
    return () => window.removeEventListener("resize", calculatePageSize)
  }, [rowHeight, reservedHeight, minSize])

  return pageSize
}
