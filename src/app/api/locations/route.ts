import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("q") || "").trim()

    if (!search || search.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const searchTerm = `%${search.toLowerCase()}%`
    
    // Search airports directly by airport name, IATA code, ICAO code, or city name/code
    const sql = `
      SELECT DISTINCT
        a.id,
        a.name,
        a.iata_code,
        a.icao_code,
        a.country_code
      FROM airports a
      LEFT JOIN cities c ON a.iata_code = c.city_code
      WHERE 
        LOWER(a.name) LIKE ? 
        OR LOWER(a.iata_code) LIKE ? 
        OR LOWER(a.icao_code) LIKE ?
        OR LOWER(c.name) LIKE ?
        OR LOWER(c.city_code) LIKE ?
      ORDER BY 
        CASE 
          WHEN LOWER(a.iata_code) = ? THEN 1
          WHEN LOWER(a.icao_code) = ? THEN 2
          WHEN LOWER(a.iata_code) LIKE ? THEN 3
          WHEN LOWER(a.icao_code) LIKE ? THEN 4
          WHEN LOWER(a.name) LIKE ? THEN 5
          ELSE 6
        END,
        a.name ASC
      LIMIT 20
    `

    const params = [
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      search.toLowerCase(), search.toLowerCase(),
      `${search.toLowerCase()}%`, `${search.toLowerCase()}%`,
      `${search.toLowerCase()}%`
    ]

    const results = await query<any[]>(sql, params)

    return NextResponse.json({ success: true, data: results || [] })
  } catch (error) {
    console.error("GET /api/locations error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations", data: [] },
      { status: 500 }
    )
  }
}
