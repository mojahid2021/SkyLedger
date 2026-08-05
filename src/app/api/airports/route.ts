import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let sql = "SELECT id, name, iata_code, icao_code, country_code FROM airports"
    const params: any[] = []

    if (search.trim()) {
      sql += " WHERE LOWER(name) LIKE ? OR LOWER(iata_code) LIKE ? OR LOWER(icao_code) LIKE ? OR LOWER(country_code) LIKE ?"
      const term = `%${search.trim().toLowerCase()}%`
      params.push(term, term, term, term)
    }

    sql += " ORDER BY CASE WHEN iata_code IS NOT NULL AND iata_code != '' THEN 0 ELSE 1 END, name ASC LIMIT 50"

    const rows = await query<any[]>(sql, params)
    return NextResponse.json({ success: true, data: rows || [] })
  } catch (error) {
    console.error("GET /api/airports error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch airports", data: [] },
      { status: 500 }
    )
  }
}
